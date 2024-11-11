import platform
import argparse
import time
import json
import re
import os
import shutil
import logging
import boto3
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import TimeoutException
from openai import OpenAI
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from dotenv import load_dotenv
import requests
from prompts import *
import agentops
import concurrent.futures
from concurrent.futures import ThreadPoolExecutor
agentops.init("4778bbb5-d133-48cb-a2c8-c98e93ce1dfc")

# Load environment variables
load_dotenv()

# Set API keys
openai_api_key = os.getenv('OPENAI_API_KEY')
google_api_key = os.getenv('GOOGLE_API_KEY')
google_cse_id = os.getenv('GOOGLE_CSE_ID')

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Constants
REGION_NAME = 'us-east-1'  # Replace with your AWS region
BUCKET_NAME = 'jobscraiper'  # Replace with your S3 bucket name


def setup_logger(task_dir):
    """Set up a logger for the specific task."""
    logger = logging.getLogger(f"task_{os.path.basename(task_dir)}")
    logger.setLevel(logging.INFO)
    
    # Create a file handler
    fh = logging.FileHandler(os.path.join(task_dir, 'task.log'))
    fh.setLevel(logging.INFO)
    
    # Create a console handler
    ch = logging.StreamHandler()
    ch.setLevel(logging.INFO)
    
    # Create a formatter
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    fh.setFormatter(formatter)
    ch.setFormatter(formatter)
    
    # Add the handlers to the logger
    logger.addHandler(fh)
    logger.addHandler(ch)
    
    return logger

def report_progress(company_id, status, jobs=None):
    """Report progress to stdout in a structured format that can be parsed by the frontend."""
    update = {
        "type": "progress_update",
        "company_id": company_id,
        "status": status
    }
    if jobs:
        update["jobs"] = jobs
    print(json.dumps(update), flush=True)

def get_job_board_link(company_name):
    """Use Google's Custom Search API to search for a company's job board."""
    search_query = f"{company_name} careers site"
    url = "https://www.googleapis.com/customsearch/v1"
    
    params = {
        'key': google_api_key,
        'cx': google_cse_id,
        'q': search_query
    }
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        
        search_results = response.json()
        for item in search_results.get('items', []):
            if "career" in item['title'].lower() or "job" in item['title'].lower():
                return item['link']
        return None
    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching job board link for {company_name}: {e}")
        return None

def search_companies(api, position, industry, location, whitelist, blacklist, company_size, num_results):
    """Use OpenAI's ChatCompletion to generate a list of companies with detailed fields."""
    whitelist_companies = [company.strip() for company in whitelist.split(',') if company.strip()]
    blacklist_companies = [company.strip() for company in blacklist.split(',') if company.strip()]
    company_size_str = ', '.join(company_size)
    
    prompt = COMPANY_SEARCH_PROMPT.format(
        position=position,
        industry=industry,
        location=location,
        company_sizes=company_size_str,
        whitelist=', '.join(whitelist_companies),
        blacklist=', '.join(blacklist_companies),
        num_results=num_results
    )

    logging.info(f"Generated prompt requesting {num_results} companies.")

    max_retries = 3
    retry_delay = 2

    for attempt in range(max_retries):
        try:
            response = api.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that provides precise lists of companies based on given criteria."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=2500,
                temperature=0.7,
            )

            content = response.choices[0].message.content.strip()
            logging.info("Received response from OpenAI.")

            if content.startswith('```'):
                content = content.strip('```')
                if content.strip().startswith('json'):
                    content = content.strip()[4:].strip()

            companies = json.loads(content)
            logging.info(f"Parsed company list successfully. Found {len(companies)} companies.")
            
            if len(companies) == num_results:
                break
            elif len(companies) > num_results:
                companies = companies[:num_results]
                logging.warning(f"Received more companies than requested. Trimmed to {num_results}.")
                break
            else:
                logging.warning(f"Received fewer companies than requested. Retrying. (Attempt {attempt + 1}/{max_retries})")
                if attempt < max_retries - 1:
                    time.sleep(retry_delay)
                    retry_delay *= 2
        except Exception as e:
            logging.error(f"Error during API call (Attempt {attempt + 1}/{max_retries}): {str(e)}")
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
                retry_delay *= 2
            else:
                raise

    if len(companies) < num_results:
        logging.error(f"Failed to retrieve {num_results} companies after {max_retries} attempts.")

    formatted_companies = []
    for idx, company in enumerate(companies, start=1):
        company_name = company.get("Company/Organization")
        company_url = company.get("Company URL")
        
        careers_url = get_job_board_link(company_name)
        if not careers_url:
            careers_url = company_url

        formatted_company = {
            "web_name": company_name,
            "id": f"{company_name}--{idx}",
            "ques": f"Scrape all job postings relating to {position} from {company_name}'s careers page, including position title, application link, and deadline.",
            "web": careers_url
        }
        formatted_companies.append(formatted_company)

    return formatted_companies

def get_web_element_rect(driver, fix_color=True):
    """Get interactive elements with improved viewport checking and stale element handling."""
    js_script = """
        let labels = [];
        
        function isElementVisible(element) {
            const rect = element.getBoundingClientRect();
            const style = window.getComputedStyle(element);
            return !(rect.width === 0 || 
                    rect.height === 0 || 
                    style.visibility === 'hidden' || 
                    style.display === 'none' ||
                    style.opacity === '0');
        }

        function isElementClickable(element) {
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // Check if element is hidden by another element
            const elementAtPoint = document.elementFromPoint(centerX, centerY);
            return elementAtPoint && (element === elementAtPoint || element.contains(elementAtPoint));
        }

        function markPage() {
            // Get viewport dimensions
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;
            const scrollY = window.pageYOffset;
            
            var items = Array.prototype.slice.call(
                document.querySelectorAll('*')
            ).filter(element => {
                // Enhanced visibility and interactivity check
                return (
                    (element.tagName === "INPUT" || 
                     element.tagName === "TEXTAREA" || 
                     element.tagName === "SELECT" ||
                     element.tagName === "BUTTON" || 
                     element.tagName === "A" || 
                     element.onclick != null || 
                     window.getComputedStyle(element).cursor === "pointer") &&
                    isElementVisible(element) &&
                    isElementClickable(element)
                );
            });

            // Filter and mark visible elements
            items = items.filter(element => {
                const rect = element.getBoundingClientRect();
                const inViewport = (
                    rect.top >= -50 && // Allow slight overflow
                    rect.left >= -50 &&
                    rect.bottom <= viewportHeight + 50 &&
                    rect.right <= viewportWidth + 50
                );
                return inViewport;
            });

            // Clear existing markers
            labels.forEach(label => label.remove());
            labels = [];

            items.forEach((element, index) => {
                const rect = element.getBoundingClientRect();
                const marker = document.createElement('div');
                marker.style.position = 'fixed';
                marker.style.left = rect.left + 'px';
                marker.style.top = rect.top + 'px';
                marker.style.width = rect.width + 'px';
                marker.style.height = rect.height + 'px';
                marker.style.border = '2px solid #FF0000';
                marker.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
                marker.style.zIndex = '10000';
                marker.style.pointerEvents = 'none';
                
                const label = document.createElement('div');
                label.textContent = index;
                label.style.position = 'absolute';
                label.style.left = '0';
                label.style.top = '-20px';
                label.style.backgroundColor = '#FF0000';
                label.style.color = 'white';
                label.style.padding = '2px 5px';
                label.style.borderRadius = '3px';
                label.style.fontSize = '12px';
                
                marker.appendChild(label);
                document.body.appendChild(marker);
                labels.push(marker);
            });

            return [labels, items];
        }
        return markPage();
    """
    
    rects, elements = driver.execute_script(js_script)
    web_elements_text = []
    
    for idx, element in enumerate(elements):
        try:
            element_text = element.get_attribute('innerText') or element.get_attribute('value') or ''
            element_tag = element.tag_name
            element_type = element.get_attribute('type') or ''
            element_aria = element.get_attribute('aria-label') or ''
            
            # Create descriptive text that includes all relevant attributes
            desc_parts = []
            if element_text.strip():
                desc_parts.append(f"'{element_text.strip()}'")
            if element_aria:
                desc_parts.append(f"aria-label='{element_aria}'")
            if element_type:
                desc_parts.append(f"type='{element_type}'")
                
            element_desc = f"[{idx}]: <{element_tag}> {' '.join(desc_parts)}"
            web_elements_text.append(element_desc)
            
        except Exception as e:
            continue
            
    return rects, elements, "\n".join(web_elements_text)


def upload_image_and_get_presigned_url(image_path, s3_client, expiration=300):
    """Upload an image to S3 and return a pre-signed URL."""
    try:
        file_name = os.path.basename(image_path)
        object_name = f"temp_images/{int(time.time())}_{file_name}"
        s3_client.upload_file(image_path, BUCKET_NAME, object_name)
        
        url = s3_client.generate_presigned_url('get_object',
                                               Params={'Bucket': BUCKET_NAME,
                                                       'Key': object_name},
                                               ExpiresIn=expiration)
        print(f"Pre-signed URL: {url}")
        return url
    except Exception as e:
        print(f"Error uploading image to S3: {e}")
        return None
    
def format_msg(iteration, init_msg, url, web_eles_text, position):
    """Format the message for the AI model."""
    # Format elements text first
    if isinstance(web_eles_text, list):
        elements_text = "\n".join(web_eles_text)
    else:
        elements_text = web_eles_text
    
    message = f"""
    Task: Find {position} job postings on this careers page.

    Available clickable elements (use these numbers in your actions):
    {elements_text}

    Remember:
    1. Use ONLY the numbers shown above in your actions
    2. Never use text descriptions in brackets, only numbers
    3. Your action MUST be in one of these formats:
    - Click [X] where X is a number from above
    - Type [X]; [content] where X is a number from above
    - Scroll [WINDOW]; [up] or [down]
    - Wait
    - GoBack
    - Google
    - ExtractJobInfo

    Analyze the screenshot and tell me what action to take."""

    return {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": message
            },
            {
                "type": "image_url",
                "image_url": {
                    "url": url
                }
            }
        ]
    }
def clip_message_and_obs(messages, max_attached_imgs):
    """Clip the message history to include only the last few images."""
    image_count = 0
    clipped_messages = []
    
    for msg in reversed(messages):
        if isinstance(msg['content'], list):
            for content in msg['content']:
                if content['type'] == 'image_url':
                    image_count += 1
                    if image_count > max_attached_imgs:
                        return list(reversed(clipped_messages))
        clipped_messages.append(msg)
    
    return list(reversed(clipped_messages))

def call_gpt4v_api(args, api, messages):
    try:
        response = api.chat.completions.create(
            model=args.api_model,
            messages=messages,
            max_tokens=1000,
            temperature=args.temperature
        )
        return False, response
    except Exception as e:
        logging.error(f"Error calling GPT-4 Vision API: {e}")
        return True, None



def extract_information(response_text):
    """Extract action and info from AI response."""
    logging.info(f"Parsing response: {response_text}")
    
    try:
        # Extract action line
        action_match = re.search(r'Action:\s*(.+)', response_text)
        if not action_match:
            logging.error("No 'Action:' found in response")
            return None, None
        
        action_line = action_match.group(1).strip()
        logging.info(f"Found action line: {action_line}")
        
        # Parse click action - format: Click [X]
        click_match = re.search(r'Click\s*\[(\d+)\]', action_line)
        if click_match:
            number = int(click_match.group(1))
            logging.info(f"Parsed click action with number: {number}")
            return 'click', {'number': number}
            
        # Parse type action - format: Type [X]; [Content]
        type_match = re.search(r'Type\s*\[(\d+)\];\s*\[(.*?)\]', action_line)
        if type_match:
            number = int(type_match.group(1))
            content = type_match.group(2)
            logging.info(f"Parsed type action with number: {number} and content: {content}")
            return 'type', {
                'number': number,
                'content': content
            }
            
        # Parse scroll action - format: Scroll [X or WINDOW]; [up or down]
        scroll_match = re.search(r'Scroll\s*\[(WINDOW|\d+)\];\s*\[(up|down)\]', action_line)
        if scroll_match:
            target = scroll_match.group(1)
            direction = scroll_match.group(2).lower()
            logging.info(f"Parsed scroll action with target: {target} and direction: {direction}")
            return 'scroll', {
                'number': target,
                'content': direction
            }
            
        # Simple actions
        if action_line == 'Wait':
            return 'wait', None
        if action_line == 'GoBack':
            return 'goback', None
        if action_line == 'Google':
            return 'google', None
        if action_line == 'ExtractJobInfo':
            return 'extractjobinfo', None
            
        logging.error(f"Could not parse action line: {action_line}")
        return None, None
        
    except Exception as e:
        logging.error(f"Error parsing action: {e}")
        return None, None


def exec_action_click(info, web_elements, driver):
    """Execute click action with improved reliability."""
    max_attempts = 3
    wait_time = 2

    for attempt in range(max_attempts):
        try:
            if not (0 <= info['number'] < len(web_elements)):
                raise ValueError(f"Invalid element index: {info['number']}")

            element = web_elements[info['number']]

            # Check if element is stale
            try:
                element.is_enabled()
            except:
                # Refresh elements if stale
                _, web_elements, _ = get_web_element_rect(driver)
                if 0 <= info['number'] < len(web_elements):
                    element = web_elements[info['number']]
                else:
                    raise ValueError("Element no longer exists after refresh")

            # Scroll element into view
            driver.execute_script("""
                arguments[0].scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'center'
                });
            """, element)

            # Wait for scroll to complete
            time.sleep(1)

            # Check if element is clickable
            if not element.is_displayed() or not element.is_enabled():
                raise ValueError("Element not interactive")

            # Get current window handles before clicking
            before_click_windows = driver.window_handles

            # Try multiple click methods
            try:
                element.click()
            except:
                try:
                    driver.execute_script("arguments[0].click();", element)
                except:
                    actions = ActionChains(driver)
                    actions.move_to_element(element).click().perform()

            # Wait for potential page updates
            time.sleep(wait_time)

            # Get window handles after clicking
            after_click_windows = driver.window_handles

            # Check if a new window has opened
            if len(after_click_windows) > len(before_click_windows):
                # Switch to the new window
                new_window = [window for window in after_click_windows if window not in before_click_windows][0]
                driver.switch_to.window(new_window)
                logging.info("Switched to new window")
            else:
                # Still on the same window
                pass

            return True

        except Exception as e:
            logging.warning(f"Click attempt {attempt + 1} failed: {str(e)}")
            if attempt < max_attempts - 1:
                time.sleep(wait_time)
                wait_time *= 1.5
            else:
                logging.error(f"Click action failed after {max_attempts} attempts")
                raise

    return False

def exec_action_scroll(info, web_elements, driver, args):
    """Execute scroll action with improved viewport management."""
    try:
        viewport_height = driver.execute_script("return window.innerHeight")
        doc_height = driver.execute_script("return document.documentElement.scrollHeight")
        current_scroll = driver.execute_script("return window.pageYOffset")
        
        # Calculate scroll amount (2/3 of viewport)
        scroll_amount = viewport_height * 2 // 3
        
        if 'content' in info:
            if info['content'] == 'down':
                # Check if we're near the bottom
                if current_scroll + viewport_height >= doc_height - 100:
                    return "EXTRACT_NOW"
                    
                # Smooth scroll down
                driver.execute_script(f"""
                    window.scrollBy({{
                        top: {scroll_amount},
                        behavior: 'smooth'
                    }});
                """)
                
            elif info['content'] == 'up':
                # Check if we're near the top
                if current_scroll <= 0:
                    return None
                    
                # Smooth scroll up
                driver.execute_script(f"""
                    window.scrollBy({{
                        top: -{scroll_amount},
                        behavior: 'smooth'
                    }});
                """)
            
            # Wait for scroll animation and dynamic content
            time.sleep(2)
            
            # Check if scroll actually happened
            new_scroll = driver.execute_script("return window.pageYOffset")
            if abs(new_scroll - current_scroll) < 50:  # Threshold for meaningful scroll
                return "EXTRACT_NOW"
                
        return None
        
    except Exception as e:
        logging.error(f"Scroll action failed: {e}")
        return None

def exec_action_type(info, web_eles, driver):
    try:
        if 'number' in info and 'content' in info and 0 <= info['number'] < len(web_eles):
            web_ele = web_eles[info['number']]
            driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center', inline: 'center'});", web_ele)
            time.sleep(1)
            web_ele.clear()
            web_ele.send_keys(info['content'])
            time.sleep(0.5)
            # Press 'Enter' after typing
            web_ele.send_keys(Keys.ENTER)
            time.sleep(1)
        else:
            logging.error(f"Invalid info for type action: {info}")
    except Exception as e:
        logging.error(f"Type action failed: {e}")


def extract_and_store_job_info(driver, task_dir, api, company_id, position):
    for attempt in range(1, 4):
        try:
            logging.info(f"Starting job info extraction (Attempt {attempt}/3)")
            report_progress(company_id, status="extracting_job_info")

            html = driver.page_source
            soup = BeautifulSoup(html, 'html.parser')
            full_text = soup.get_text(separator='\n', strip=True)

            current_url = driver.current_url
            base_url = "{0.scheme}://{0.netloc}".format(urlparse(current_url))
            links = [urljoin(base_url, a_tag['href']) for a_tag in soup.find_all('a', href=True)]

            max_length = 4000
            if len(full_text) > max_length:
                full_text = full_text[:max_length]

            prompt = f"""
                {JOB_EXTRACTION_PROMPT}

                Position to extract: {position}

                Text Content:
                {full_text}

                Available Links:
                {links}

                Please output only the JSON array of job postings. Do not include any explanations or additional text.
            """

            response = api.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are an assistant that extracts job postings from text and returns them as a JSON array."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2,
                max_tokens=2000
            )

            assistant_response = response.choices[0].message.content
            
            json_match = re.search(r'\[\s*\{[\s\S]*?\}\s*\]', assistant_response)
            if not json_match:
                raise ValueError("No JSON array found in the assistant's response.")

            json_content = json_match.group(0)
            extracted_info = json.loads(json_content)
            if not isinstance(extracted_info, list) or len(extracted_info) == 0:
                raise ValueError("Extracted JSON is empty or not a list.")

            for job in extracted_info:

                app_link = job.get("Application Link")
                if app_link and is_valid_url(app_link):
                    try:
                        driver.get(app_link)
                        driver.implicitly_wait(5)
                        app_page_html = driver.page_source
                        app_page_soup = BeautifulSoup(app_page_html, 'html.parser')
                        job['Additional Details'] = app_page_soup.get_text(separator='\n', strip=True)[:100]
                    except Exception as e:
                        job['Additional Details'] = f"Error fetching additional details: {str(e)}"
                else:
                    job['Application Link'] = "N/A"

            os.makedirs(task_dir, exist_ok=True)
            if extracted_info:
                temp_file_path = os.path.join(task_dir, 'job_results_temp.json')
                final_file_path = os.path.join(task_dir, 'job_results.json')
                with open(temp_file_path, 'w', encoding='utf-8') as f:
                    json.dump(extracted_info, f, indent=2)
                os.replace(temp_file_path, final_file_path)
                
                report_progress(company_id, "completed", extracted_info)
                return extracted_info
            else:
                report_progress(company_id, "error", {"message": "No jobs found"})
                return []

        except Exception as e:
            logging.error(f"Error during extraction attempt {attempt}: {e}")
            if attempt < 3:
                report_progress(company_id, "retrying")
                time.sleep(2)
            else:
                report_progress(company_id, "error", {"message": str(e)})
                return []

    return []



def is_valid_url(url):
    """Check if a URL is valid."""
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except ValueError:
        return False


def navigate_and_scrape(driver, api, company, position, task_dir, args):
    logging.info(f"Navigating and scraping for company: {company['web_name']}")
    report_progress(company['id'], "navigating")

    driver.get(company['web'])
    time.sleep(3)  # Give more time for initial page load

    messages = [{
        'role': 'system', 
        'content': SYSTEM_PROMPT
    }]
    
    init_msg = f"Task: Find {position} job postings on this careers page. Navigate the page and use extractjobinfo when you find the job listings."

    for iteration in range(args.max_iter):
        logging.info(f'Iteration: {iteration}')

        try:
            # Get interactive elements
            rects, web_eles, web_eles_text = get_web_element_rect(driver, fix_color=args.fix_box_color)
            if not web_eles:
                logging.warning("No interactive elements found on page")
                break

            # Take screenshot
            img_path = os.path.join(task_dir, f'screenshot{iteration}.png')
            driver.save_screenshot(img_path)
            
            # Upload to S3
            s3_client = boto3.client('s3', region_name=REGION_NAME)
            url = upload_image_and_get_presigned_url(img_path, s3_client, expiration=300)
            
            # Format message for AI
            curr_msg = format_msg(
                iteration=iteration,
                init_msg=init_msg,
                url=url,
                web_eles_text=web_eles_text,
                position=position
            )
            messages.append(curr_msg)

            # Get AI response
            logging.info('Calling OpenAI API...')
            gpt_call_error, openai_response = call_gpt4v_api(args, api, messages)
            
            if gpt_call_error:
                logging.error("API call failed")
                break

            response_text = openai_response.choices[0].message.content
            logging.info(f"AI Response: {response_text}")
            messages.append({'role': 'assistant', 'content': response_text})

            # Extract and execute action
            if "Action:" not in response_text:
                logging.error("No action found in response")
                continue

            action_key, info = extract_information(response_text)
            logging.info(f"Action: {action_key}, Info: {info}")

            if not action_key:
                # Add correction message
                correction_msg = {
                    "role": "assistant",
                    "content": """Error: Your previous action format was incorrect.
            You must use EXACT format with numerical labels, like this:
            - Click [0]  <- Use the number from the available elements
            - Type [1]; [Search text]
            - Scroll [WINDOW]; [down]
            - ExtractJobInfo

            Please try again with the correct format."""
                }
                messages.append(correction_msg)
                continue

            if action_key == 'extractjobinfo':
                jobs = extract_and_store_job_info(driver, task_dir, api, company['id'], position)
                if jobs:
                    return jobs
                continue

            # Execute navigation action
            try:
                if action_key == 'click' and info and 'number' in info:
                    if 0 <= info['number'] < len(web_eles):
                        exec_action_click(info, web_eles, driver)
                    else:
                        logging.error(f"Invalid element number: {info['number']}")
                elif action_key == 'type' and info:
                    exec_action_type(info, web_eles, driver)
                elif action_key == 'scroll':
                    exec_action_scroll(info, web_eles, driver, args)
                elif action_key == 'wait':
                    time.sleep(3)
                elif action_key == 'goback':
                    driver.back()
                    time.sleep(2)
                else:
                    logging.warning(f"Unknown action: {action_key}")
                    continue

                time.sleep(2)  # Wait after each action
            except Exception as e:
                logging.error(f"Error executing action: {e}")
                continue

        except Exception as e:
            logging.error(f'Error during iteration {iteration}: {e}')
            continue

    logging.warning(f"Max iterations reached for {company['web_name']}")
    return []



def driver_config(args):
    options = webdriver.ChromeOptions()
    if args.headless:
        options.add_argument("--headless")
    options.add_argument(f"--window-size={args.window_width},{args.window_height}")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_experimental_option(
        "prefs", {
            "download.default_directory": args.download_dir,
            "plugins.always_open_pdf_externally": True
        }
    )
    return options

def process_company(company, api, args, result_dir):
    company_id = company['id']
    task_dir = os.path.join(result_dir, f"task_{company_id}")
    os.makedirs(task_dir, exist_ok=True)
    logger = setup_logger(task_dir)
    
    # Report starting scraping for this company
    print(json.dumps({
        "type": "progress_update",
        "company_id": company_id,
        "status": "searching"
    }), flush=True)
    
    options = driver_config(args)
    driver = webdriver.Chrome(options=options)
    driver.set_window_size(args.window_width, args.window_height)
    
    try:
        job_results = navigate_and_scrape(driver, api, company, args.position, task_dir, args)
        if job_results and len(job_results) > 0:
            report_progress(company_id, "completed", job_results)
            return company_id, job_results
        else:
            # Create a placeholder result when no jobs are found
            empty_result = [{
                "Company Name": company['web_name'],
                "Job Title": "No matching positions found",
                "Application Link": company['web'],
                "Job Description": "Our AI couldn't find matching positions. Please visit the company's career board directly.",
                "Required Certifications": [],
                "Location": "N/A",
                "Additional Details": "Note: Our AI search may miss some positions. We recommend checking the company's career board."
            }]
            report_progress(company_id, "no_jobs_found", empty_result)
            return company_id, empty_result
    except Exception as e:
        logger.error(f"Error processing company {company_id}: {str(e)}")
        # Create an error result
        error_result = [{
            "Company Name": company['web_name'],
            "Job Title": "Error searching positions",
            "Application Link": company['web'],
            "Job Description": "An error occurred while searching. Please visit the company's career board directly.",
            "Required Certifications": [],
            "Location": "N/A",
            "Additional Details": f"Error: {str(e)}"
        }]
        report_progress(company_id, "error", error_result)
        return company_id, error_result
    finally:
        driver.quit()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output_dir", type=str, default='results')
    parser.add_argument("--download_dir", type=str, default="downloads")
    parser.add_argument("--text_only", action='store_true')
    parser.add_argument('--position', type=str, required=True, help='Job position to search for')
    parser.add_argument('--location', type=str, required=True, help='Location to search in')
    parser.add_argument('--industry', type=str, required=True, help='Industry to search in')
    parser.add_argument('--whitelist', type=str, default='', help='Companies to include (comma-separated)')
    parser.add_argument('--blacklist', type=str, default='', help='Companies to exclude (comma-separated)')
    parser.add_argument('--company_size', nargs='+', default=['any'], help='Company sizes to include')
    parser.add_argument('--num_results', type=int, default=10, help='Number of results to return')
    parser.add_argument('--ignore_searched', type=str, default='0', help='Whether to ignore previously searched positions (1 or 0)')
    parser.add_argument('--max_iter', type=int, default=10)
    parser.add_argument('--api_key', type=str, default=openai_api_key)
    parser.add_argument('--max_attached_imgs', type=int, default=3)
    parser.add_argument('--temperature', type=float, default=0.2)
    parser.add_argument('--fix_box_color', action='store_true', default=True)
    parser.add_argument('--api_model', type=str, default='gpt-4o-mini')
    parser.add_argument('--seed', type=int, default=42)
    parser.add_argument("--headless", action='store_true', help='Run browser in headless mode')
    parser.add_argument("--window_width", type=int, default=1224)
    parser.add_argument("--window_height", type=int, default=968)

    args = parser.parse_args()

    # Convert ignore_searched to boolean if needed
    args.ignore_searched = args.ignore_searched == '1'

    # Set up API and WebDriver
    api = OpenAI(api_key=args.api_key)

    try:
        # Search for companies
        raw_companies = search_companies(api, args.position, args.industry, args.location, 
                                      args.whitelist, args.blacklist, args.company_size, args.num_results)

        # Format and send initial companies list
        companies = [{
            "id": company['id'],
            "name": company['web_name'],
            "web": company['web'],
            "status": "pending"
        } for company in raw_companies]

        print(json.dumps({
            "type": "companies_list",
            "companies": companies
        }), flush=True)

        # Set up result directory
        current_time = time.strftime("%Y%m%d_%H_%M_%S", time.localtime())
        result_dir = os.path.join(args.output_dir, current_time)
        os.makedirs(result_dir, exist_ok=True)

        jobs = {}
        
        # Process companies in parallel
        max_workers = min(4, len(raw_companies))  # Limit max parallel processes
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            # Submit all companies for processing
            future_to_company = {
                executor.submit(
                    process_company, 
                    company, 
                    api, 
                    args, 
                    result_dir
                ): company for company in raw_companies
            }

            # Collect results as they complete
            for future in concurrent.futures.as_completed(future_to_company):
                company_id, job_results = future.result()
                if job_results:
                    jobs[company_id] = job_results

        # Print final result
        final_result = {
            "type": "final_result",
            "companies": companies,
            "jobs": jobs
        }
        print(json.dumps(final_result))

    except Exception as e:
        logging.error(f"Error in main process: {str(e)}")
        print(json.dumps({
            "type": "error",
            "error": str(e)
        }))

if __name__ == '__main__':
    main()