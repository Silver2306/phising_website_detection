#Extractor for the CompPhish Dataset
import math
import re
from collections import Counter
from urllib.parse import urlparse, urljoin

import tldextract
from bs4 import BeautifulSoup


# ============================================================
# FREE HOSTING DOMAINS
# Taken from CompPhish free_hosting_services.txt
# ============================================================

FREE_HOSTING_DOMAINS = {
    "000webhost.com",
    "000webhostapp.com",
    "20m.com",
    "50webs.com",
    "altervista.org",
    "angelfire.com",
    "atspace.com",
    "awardspace.biz",
    "awardspace.com",
    "biz.ly",
    "biz.nf",
    "blogspot.com",
    "bravenet.com",
    "byet.host",
    "cloudaccess.host",
    "cyberfolks.pl",
    "da.gd",
    "epizy.com",
    "fastwebhost.in",
    "fc2web.com",
    "firebaseapp.com",
    "freehostia.com",
    "freehosting.com",
    "freehostingcloud.com",
    "freehostingnoads.net",
    "freevar.com",
    "freewebhostingarea.com",
    "freewebpages.org",
    "geocities.ws",
    "github.io",
    "googiehost.com",
    "great-site.net",
    "heliohost.org",
    "host-ed.net",
    "hostinger.com",
    "infinityfree.com",
    "infinityfree.net",
    "is-best.net",
    "jimdosite.com",
    "koolhost.com",
    "lima-city.de",
    "mypage.tokyo",
    "neocities.org",
    "netlify.app",
    "pages.dev",
    "plaza.rakuten.co.jp",
    "profreehost.com",
    "pubhtml5.com",
    "rf.gd",
    "shn-host.com",
    "simbahost.com",
    "sites.google.com",
    "strikingly.com",
    "tilda.ws",
    "tripod.com",
    "tripod.lycos.com",
    "ucoz.com",
    "ucraft.site",
    "ulcraft.com",
    "vercel.app",
    "web.app",
    "webnode.com",
    "webs.com",
    "weebly.com",
    "weeblysite.com",
    "wixsite.com",
    "x10hosting.com",
    "yolasite.com",
    "zohosites.com",
}


# ============================================================
# 1. DOMAIN LENGTH
# ============================================================

def extract_domain(url):
    domain = urlparse(url).netloc

    if domain.startswith("www."):
        domain = domain[4:]

    return domain


def domain_length(url):
    return len(extract_domain(url))


# ============================================================
# 2. URL ENTROPY
# Exact CompPhish calculation
# ============================================================

def calculate_entropy(url):
    if not url:
        return 0.0

    char_counts = Counter(url)
    total_chars = len(url)

    entropy = -sum(
        (count / total_chars) * math.log2(count / total_chars)
        for count in char_counts.values()
    )

    return entropy


# ============================================================
# 3. COUNT WWW
# Exact CompPhish calculation
# ============================================================

def count_www_in_url(url):
    return sum(
        "www" in word
        for word in re.split(r"\W+", url)
    )


# ============================================================
# 4. AVERAGE LENGTH OF WORDS
# Exact CompPhish tokenizer + calculation
# ============================================================

def tokenize_url(url):
    return re.split(r"\W+", url)


def average_word_length(words_raw):
    if len(words_raw) == 0:
        return 0

    return sum(len(word) for word in words_raw) / len(words_raw)


# ============================================================
# 5. URL LENGTH
# ============================================================

def url_length(url):
    return len(url)


# ============================================================
# 6. NUMBER OF SLASHES IN PATH
# Exact CompPhish calculation
# ============================================================

def no_of_slashes_inpath(url):
    parsed = urlparse(url)

    return parsed.path.count("/")


# ============================================================
# 7. HOSTNAME DIGIT RATIO
# Exact CompPhish calculation
# ============================================================

def get_hostname(url):
    extracted = tldextract.extract(url)

    hostname = ".".join(
        part
        for part in [
            extracted.subdomain,
            extracted.domain,
            extracted.suffix
        ]
        if part
    )

    return hostname.lower()


def hostname_digit_ratio(url):
    hostname = get_hostname(url)

    if hostname:
        digit_count = len(
            re.sub(r"[^0-9]", "", hostname)
        )

        total_length = len(hostname)

        return digit_count / total_length

    return 0


# ============================================================
# 8. INTERNAL LINKS
# Exact CompPhish link-counting logic
# ============================================================

def is_shortened_url(url):
    # Not one of our final 13 features directly,
    # but required by the original link-processing logic.
    shortened_domains = {
        "bit.ly",
        "tinyurl.com",
        "goo.gl",
        "t.co",
        "ow.ly",
        "is.gd",
        "buff.ly",
        "adf.ly",
        "bit.do",
        "cutt.ly",
        "rebrand.ly",
        "shorturl.at",
        "rb.gy",
    }

    domain = urlparse(url).netloc.lower()

    return int(domain in shortened_domains)


def count_internal_links(url, html):
    soup = BeautifulSoup(html, "html.parser")

    href_links = soup.find_all(href=True)
    src_links = soup.find_all(src=True)
    form_links = soup.find_all("form")

    empty_patterns = {
        "",
        "null",
        "javascript:void(0)"
    }

    self_pattern = "#"

    parsed_base = urlparse(url)
    base_domain = parsed_base.netloc

    internal_count = 0
    external_count = 0
    empty_count = 0
    self_count = 0
    shortened_count = 0

    # Process href and src attributes
    tags = href_links + src_links

    for tag in tags:

        link = (
            tag.get("href")
            or tag.get("src")
            or ""
        )

        link_clean = link.strip().lower()

        if link_clean == self_pattern:
            self_count += 1
            continue

        elif link_clean in empty_patterns:
            empty_count += 1
            continue

        full_url = urljoin(url, link_clean)

        parsed = urlparse(full_url)
        netloc = parsed.netloc.lower()

        if is_shortened_url(full_url):
            shortened_count += 1

        if netloc == base_domain:
            internal_count += 1
        else:
            external_count += 1

    # Process form actions
    for form in form_links:

        action = form.get(
            "action",
            ""
        ).strip().lower()

        if action == self_pattern:
            self_count += 1
            continue

        elif action in empty_patterns or action == "":
            empty_count += 1
            continue

        full_url = urljoin(url, action)

        parsed = urlparse(full_url)
        netloc = parsed.netloc.lower()

        if is_shortened_url(full_url):
            shortened_count += 1

        if netloc == base_domain:
            internal_count += 1
        else:
            external_count += 1

    return internal_count


# ============================================================
# 9. PRESENCE OF FREE HOSTING
# Exact CompPhish logic
# ============================================================

def presence_of_free_hosting(url):
    domain = urlparse(url).netloc.lower()

    return int(
        any(
            domain.endswith(free_domain)
            for free_domain in FREE_HOSTING_DOMAINS
        )
    )


# ============================================================
# 10. NUMBER OF IMAGES
# Exact CompPhish calculation
# ============================================================

def number_of_images(html):
    soup = BeautifulSoup(html, "html.parser")

    return len(
        soup.find_all("img")
    )


# ============================================================
# 11. TITLE MISMATCH WITH DOMAIN
# Exact CompPhish calculation
# ============================================================

def title_mismatch_with_domain(url, html):
    soup = BeautifulSoup(html, "html.parser")

    hostname = get_hostname(url)

    parts = hostname.split(".")

    if len(parts) >= 2:
        domain_core = parts[-2]
    else:
        domain_core = (
            parts[0]
            if parts
            else ""
        )

    title_tag = (
        soup.title.string.strip().lower()
        if soup.title and soup.title.string
        else ""
    )

    return int(
        domain_core.lower() not in title_tag
    )


# ============================================================
# 12. COPYRIGHT MISMATCH
# Exact CompPhish calculation
# ============================================================

def copyright_mismatch(url, html):
    soup = BeautifulSoup(html, "html.parser")

    hostname = get_hostname(url)

    parts = hostname.split(".")

    if len(parts) >= 2:
        domain_core = parts[-2]
    else:
        domain_core = (
            parts[0]
            if parts
            else ""
        )

    symbols = r"(\u00A9|\u2122|\u00AE)"

    content_text = soup.get_text(
        " ",
        strip=True
    )

    matches = list(
        re.finditer(
            symbols,
            content_text
        )
    )

    copyright_mismatch = 1

    if matches:

        for match in matches:

            start = max(
                0,
                match.start() - 50
            )

            end = match.end() + 50

            window = content_text[
                start:end
            ].lower()

            if domain_core in window:
                copyright_mismatch = 0
                break

    return copyright_mismatch


# ============================================================
# 13. SCRIPT LOADED FROM EXTERNAL DOMAIN
# Exact CompPhish calculation
# ============================================================

def script_loaded_from_external_domain(url, html):
    soup = BeautifulSoup(html, "html.parser")

    hostname = get_hostname(url)

    return int(
        any(
            urlparse(
                script.get("src", "")
            ).netloc not in hostname
            for script in soup.find_all("script")
            if script.get("src")
        )
    )


# ============================================================
# MAIN EXTRACTOR
# ============================================================

SELECTED_FEATURES = [
    "domain_length",
    "url_entropy",
    "count_www",
    "average_length_of_words",
    "url_length",
    "no_of_slashes_inpath",
    "hostname_digit_ratio",
    "no_of_internal_links",
    "presence_of_free_hosting",
    "no_of_Images",
    "title_mismatch_with_domain",
    "is_copyright_mismatch",
    "Script_loaded_from_ext_domain",
]


def extract_features(url, html):
    """
    Extract the exact 13 features required
    by the trained CompPhish Random Forest model.
    """

    words_raw = tokenize_url(url)

    features = {
        "domain_length":
            domain_length(url),

        "url_entropy":
            calculate_entropy(url),

        "count_www":
            count_www_in_url(url),

        "average_length_of_words":
            average_word_length(words_raw),

        "url_length":
            url_length(url),

        "no_of_slashes_inpath":
            no_of_slashes_inpath(url),

        "hostname_digit_ratio":
            hostname_digit_ratio(url),

        "no_of_internal_links":
            count_internal_links(url, html),

        "presence_of_free_hosting":
            presence_of_free_hosting(url),

        "no_of_Images":
            number_of_images(html),

        "title_mismatch_with_domain":
            title_mismatch_with_domain(url, html),

        "is_copyright_mismatch":
            copyright_mismatch(url, html),

        "Script_loaded_from_ext_domain":
            script_loaded_from_external_domain(
                url,
                html
            ),
    }

    return features
