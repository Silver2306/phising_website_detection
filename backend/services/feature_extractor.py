from urllib.parse import urlparse, urljoin
import ipaddress
import requests
from bs4 import BeautifulSoup
import unicodedata

# i am adding this function for url only model, this has the exact same code as the below function but only contains url feature extraction
def extract_url_features(url):

    parsed = urlparse(url)

    # is_https
    is_https = 1 if parsed.scheme == "https" else 0

    # no_of_special_chars
    no_of_other_special_chars_in_url = sum(
        not c.isalnum() for c in url
    )

    # url_length
    url_length = len(url)
    no_of_letters = sum(c.isalpha() for c in url)
    letter_ratio_in_url = no_of_letters / url_length

    # no_of_digits
    no_of_digits = sum(c.isdigit() for c in url)
    digit_ratio_in_url = no_of_digits / url_length

    # no_of_special_chars
    no_of_special_chars = sum(
        not c.isalnum() for c in url
    )
    special_char_ratio_in_url = (
        no_of_special_chars / url_length
    )

    return {
        "IsHTTPS": is_https,
        "NoOfOtherSpecialCharsInURL": no_of_other_special_chars_in_url,
        "LetterRatioInURL": letter_ratio_in_url,
        "DegitRatioInURL": digit_ratio_in_url,
        "SpecialCharRatioInURL": special_char_ratio_in_url
    }

def extract_basic_features(url):

    response = requests.get(url, timeout=10)

    html = response.text

    #beautifulsoup4
    soup = BeautifulSoup(html, "html.parser")

    parsed = urlparse(url)
    domain = parsed.hostname

    # is_https
    is_https = 1 if parsed.scheme == "https" else 0

    # no_of_special_chars    
    no_of_other_special_chars_in_url = sum(not c.isalnum() for c in url)

    # url_length
    url_length = len(url)
    no_of_letters = sum(c.isalpha() for c in url)
    letter_ratio_in_url = no_of_letters / url_length

    # no_of_digits
    no_of_digits = sum(c.isdigit() for c in url)
    digit_ratio_in_url = no_of_digits / url_length

    # no_of_special_chars
    no_of_special_chars = sum(not c.isalnum() for c in url)
    special_char_ratio_in_url = no_of_special_chars / url_length

    #no_of_external_ref
    no_of_external_ref = 0

    current_domain = domain.lower()

    if current_domain.startswith("www."):
        current_domain = current_domain[4:]

    for link in soup.find_all("a", href=True):

        href = link.get("href", "").strip()

        if not href:
            continue

        # Convert relative URL into an absolute URL
        absolute_url = urljoin(url, href)

        parsed_link = urlparse(absolute_url)

        link_domain = parsed_link.hostname

        if not link_domain:
            continue

        link_domain = link_domain.lower()

        if link_domain.startswith("www."):
            link_domain = link_domain[4:]

        if link_domain != current_domain:
            no_of_external_ref += 1

    # no_of_self_ref
    no_of_self_ref = 0

    for link in soup.find_all("a", href=True):

        href = link.get("href", "").strip()

        if not href:
            continue

        # Convert relative URL into an absolute URL
        absolute_url = urljoin(url, href)

        parsed_link = urlparse(absolute_url)

        link_domain = parsed_link.hostname

        if not link_domain:
            continue

        link_domain = link_domain.lower()

        if link_domain.startswith("www."):
            link_domain = link_domain[4:]

        current_domain = domain.lower()

        if current_domain.startswith("www."):
            current_domain = current_domain[4:]

        if link_domain == current_domain:
            no_of_self_ref += 1

    # no_of_js
    scripts = soup.find_all("script")
    no_of_js = len(scripts)
    # line_of_code
    line_of_code = len(html.splitlines())
    
    # no_of_image
    images = soup.find_all("img")
    no_of_image = len(images)

    # largest_line_length
    largest_line_length = max(len(line) for line in html.splitlines())

    # has_social_net
    social_domains = {
        "facebook.com",
        "instagram.com",
        "x.com",
        "twitter.com",
        "linkedin.com",
        "youtube.com",
        "tiktok.com",
        "pinterest.com",
        "reddit.com",
        "snapchat.com",
        "threads.net",
        "tumblr.com",
        "flickr.com",
        "vk.com",
        "weibo.com",
        "wechat.com",
        "discord.com",
        "telegram.org",
        "t.me",
        "whatsapp.com",
        "whatsapp.net",
        "messenger.com",
        "line.me",
        "medium.com",
        "quora.com"
    }
    has_social_net = 0

    for link in soup.find_all("a", href=True):

        href = link.get("href", "").strip()

        if not href:
            continue

        parsed_link = urlparse(href)

        hostname = parsed_link.hostname

        if not hostname:
            continue

        hostname = hostname.lower()

        if hostname.startswith("www."):
            hostname = hostname[4:]

        if hostname in social_domains:
            has_social_net = 1
            break

    # copyright_info
    copyright_keywords = [
        "copyright",
        "all rights reserved",
        "©"
    ]

    page_text = soup.get_text(" ", strip=True).lower()

    has_copyright_info = 0

    for keyword in copyright_keywords:
        if keyword in page_text:
            has_copyright_info = 1
            break

    # has_description
    description = soup.find("meta", {"name": "description"})
    has_description = 1 if description else 0

    # domain_title_match_score
    title = soup.title.get_text(strip=True) if soup.title else ""
    def TitleMatchScore(Set, Txt):
        score = 0
        baseScore = 100 / len(Txt)

        for element in Set:
            if Txt.find(element) >= 0:
                n = len(element)
                score = score + baseScore * n
                Txt = Txt.replace(element, "")

        if score > 99.9:
            score = 100

        return score
    tld = domain.split(".")[-1]

    clean_title = "".join(
        c for c in title
        if unicodedata.category(c) != "Cf"
    )
    tSet = clean_title.lower().split()
    txtDomain = domain.lower().replace("www.", "").replace("." + tld.lower(), "").replace("/", "")
    domain_title_match_score = TitleMatchScore(tSet, txtDomain)
    print("Domain-Title Match Score:", domain_title_match_score)


    # url_title_match_score
    txtURL = url.lower().replace("https://", "").replace("http://", "").replace("www.", "").replace("." + tld, "").replace("/", "")
    url_title_match_score = TitleMatchScore(tSet, txtURL)
    print("URL-Title Match Score:", url_title_match_score)

    return {
        "IsHTTPS": is_https,
        "NoOfOtherSpecialCharsInURL": no_of_other_special_chars_in_url,
        "LetterRatioInURL": letter_ratio_in_url,
        "DegitRatioInURL": digit_ratio_in_url,
        "SpecialCharRatioInURL": special_char_ratio_in_url,
        "NoOfExternalRef": no_of_external_ref,
        "NoOfSelfRef": no_of_self_ref,
        "NoOfJS": no_of_js,
        "LineOfCode": line_of_code,
        "NoOfImage": no_of_image,
        "LargestLineLength": largest_line_length,
        "HasSocialNet": has_social_net,
        "HasCopyrightInfo": has_copyright_info,
        "HasDescription": has_description,
        "DomainTitleMatchScore": domain_title_match_score
    }
