from urllib.parse import urlparse


def char_continuation_rate(url):
    ln = len(url)

    if ln == 0:
        return 0

    chC, nmC, spC = 0, 0, 0
    maxCh, maxNm, maxSp = 0, 0, 0

    for i in range(ln):
        ch = url[i]

        if ch.isalpha():
            chC += 1

            if nmC > 0:
                if maxNm < nmC:
                    maxNm = nmC
                    nmC = 0

            elif spC > 0:
                if maxSp < spC:
                    maxSp = spC
                    spC = 0

            nmC, spC = 0, 0

        elif ch.isdigit():
            nmC += 1

            if chC > 0:
                if maxCh < chC:
                    maxCh = chC
                    chC = 0

            elif spC > 0:
                if maxSp < spC:
                    maxSp = spC
                    spC = 0

            chC, spC = 0, 0

        else:
            spC += 1

            if nmC > 0:
                if maxNm < nmC:
                    maxNm = nmC
                    nmC = 0

            elif chC > 0:
                if maxCh < chC:
                    maxCh = chC
                    chC = 0

            nmC, chC = 0, 0

    if maxCh < chC:
        maxCh = chC

    if maxNm < nmC:
        maxNm = nmC

    if maxSp < spC:
        maxSp = spC

    return (maxCh + maxNm + maxSp) / ln


def extract_basic_features(url):

    parsed = urlparse(url)

    domain = parsed.netloc

    # Remove port if present
    if ":" in domain:
        domain = domain.split(":")[0]

    # Feature 1: IsHTTPS
    is_https = 1 if parsed.scheme.lower() == "https" else 0

    # Feature 2: DomainLength
    domain_length = len(domain)

    # Feature 3: NoOfSubDomain
    domain_parts = domain.split(".")

    if len(domain_parts) >= 2:
        no_of_subdomains = len(domain_parts) - 2
    else:
        no_of_subdomains = 0

    # Prepare URL for character-based features
    normalized_url = url.rstrip("/")
    url_without_protocol = normalized_url.split("://", 1)[-1]

    if url_without_protocol.startswith("www."):
        url_for_counting = url_without_protocol[4:-1]
        ratio_length = len(normalized_url) - 1
    else:
        url_for_counting = url_without_protocol
        ratio_length = len(normalized_url)

    no_of_letters = sum(
        char.isalpha()
        for char in url_for_counting
    )

    no_of_digits = sum(
        char.isdigit()
        for char in url_for_counting
    )

    special_chars = sum(
        not char.isalnum()
    for char in url_for_counting
)

    # Feature 4: LetterRatioInURL
    letter_ratio = round(
    no_of_letters / ratio_length,
    3
    )
    
    # Feature 5: DegitRatioInURL
    digit_ratio = round(
        no_of_digits / ratio_length,
        3
    )

    # Feature 6: SpacialCharRatioInURL
    special_char_ratio = round(
        special_chars / ratio_length,
        3
    )

    # Feature 7: CharContinuationRate
    char_domain = domain

    # Dataset calculation excludes www.
    if char_domain.startswith("www."):
        char_domain = char_domain[4:]

    # Dataset calculation excludes final TLD
    char_domain_parts = char_domain.split(".")

    if len(char_domain_parts) > 1:
        domain_without_tld = ".".join(char_domain_parts[:-1])
    else:
        domain_without_tld = char_domain

    char_cont_rate = char_continuation_rate(
        domain_without_tld
    )

    return {
        "IsHTTPS": is_https,
        "LetterRatioInURL": letter_ratio,
        "SpacialCharRatioInURL": special_char_ratio,
        "DegitRatioInURL": digit_ratio,
        "NoOfSubDomain": no_of_subdomains,
        "DomainLength": domain_length,
        "CharContinuationRate": char_cont_rate
    }