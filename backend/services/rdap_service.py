import os
import requests
import tldextract

from datetime import datetime, timezone


RDAP_BASE_URL = os.getenv("RDAP_BASE_URL")

if not RDAP_BASE_URL:
    raise ValueError("RDAP_BASE_URL is not set")


def get_registered_domain(url):
    extracted = tldextract.extract(url)

    if not extracted.domain or not extracted.suffix:
        return None

    return f"{extracted.domain}.{extracted.suffix}"


def get_event_date(events, event_name):
    for event in events:
        if event.get("eventAction") == event_name:
            return event.get("eventDate")

    return None


def get_registrar(entities):
    for entity in entities:
        if "registrar" in entity.get("roles", []):
            vcard = entity.get("vcardArray", [])

            if len(vcard) > 1:
                for item in vcard[1]:
                    if item[0] == "fn":
                        return item[3]

    return None


def calculate_domain_age(creation_date):
    if not creation_date:
        return None

    try:
        created = datetime.fromisoformat(
            creation_date.replace("Z", "+00:00")
        )

        today = datetime.now(timezone.utc)

        return (today - created).days

    except ValueError:
        return None


def get_domain_age_message(days):
    if days is None:
        return "Domain age unavailable"

    if days < 30:
        return "Recently registered domain"

    if days < 180:
        return "Relatively new domain"

    if days < 365:
        return "Domain registered within the last year"

    return "Established domain"


def get_rdap_info(url):
    domain = get_registered_domain(url)

    if not domain:
        return {
            "available": False,
            "error": "Could not extract a valid registered domain."
        }

    try:
        response = requests.get(
            f"{RDAP_BASE_URL}/{domain}",
            timeout=6,
            allow_redirects=True
        )

        if response.status_code != 200:
            return {
                "available": False,
                "domain": domain,
                "error": f"RDAP lookup failed with status {response.status_code}"
            }

        data = response.json()

        events = data.get("events", [])

        creation_date = get_event_date(events, "registration")
        expiration_date = get_event_date(events, "expiration")
        last_updated = get_event_date(events, "last changed")

        domain_age_days = calculate_domain_age(creation_date)
        domain_age_years = round(domain_age_days / 365.25, 1)

        registrar = get_registrar(
            data.get("entities", [])
        )

        nameservers = [
            ns.get("ldhName")
            for ns in data.get("nameservers", [])
            if ns.get("ldhName")
        ]

        dnssec = data.get(
            "secureDNS", {}
        ).get(
            "delegationSigned"
        )

        return {
            "available": True,
            "domain": domain,
            "creation_date": creation_date,
            "expiration_date": expiration_date,
            "last_updated": last_updated,
            "domain_age_days": domain_age_days,
            "domain_age_years": domain_age_years,
            "domain_age_message": get_domain_age_message(
                domain_age_days
            ),
            "registrar": registrar,
            "dnssec": dnssec,
            "nameservers": nameservers,
            "status": data.get("status", [])
        }

    except requests.Timeout:
        return {
            "available": False,
            "domain": domain,
            "error": "RDAP lookup timed out."
        }

    except requests.RequestException as e:
        return {
            "available": False,
            "domain": domain,
            "error": str(e)
        }

    except Exception as e:
        return {
            "available": False,
            "domain": domain,
            "error": str(e)
        }