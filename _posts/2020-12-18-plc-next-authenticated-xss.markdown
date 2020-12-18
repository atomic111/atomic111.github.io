---
layout: post
title: "CVE-2020-12517: PLCnext AXC F 2152 Stored Cross-Site-Scripting (Authenticated)"
date:   2020-12-18 11:23:00
image:
      url: /assets/article_images/2016-05-30-inspec-cis-docker/cover.jpeg
video: false
comments: true
theme_color: 302F2D

author: 'Patrick Münch'

author_image: "https://avatars0.githubusercontent.com/u/7220740?s=400"
author_link: "https://twitter.com/atomiczero111"
---

# Overview

- Vendor: PHOENIX CONTACT
- Product: PLCnext AXC F 2152
- Version: 2020.01 LTS
- Vulnerability:  Stored Cross-Site-Scripting (Authenticated)
- Fixed Version: 2021.0 LTS

# Background

From the vendor's website:
"PLCnext Control devices enable you to work flexibly with your preferred programming languages, whether IEC 61131-3 or high-level languages. Unlimited flexibility with the quick and easy integration of open-source software and apps, current and future communication standards, and intelligent networking through connection to the cloud afford maximum freedom for your transition into the digital age."

## About the Vendor

PHOENIX CONTACT immediately took care of the vulnerability and provided appropriate firmware very promptly. This is how we imagine vendors should deal with vulnerabilities.

Thank you at PHOENIX CONTACT!!!

# Issue Description

While analyzing the implementation of the PLCnext AXC F 2152 web interface, multiple stored cross-site-scripting (XSS) vulnerabilitues have been identified, which can be exploited by an authenticated, low privileged user to get admin rights, after an admin user visits the vulnerable website.

As an example, the Vulnerabilites were spotted in the following HTTP-Parameters, which were not checked and santized correctly:

~~~ text
/wbm/UserManager.cgi?AddUser
- username
/wbm/TrustStoreManager.cgi?addStore
- TrustStoreName
/wbm/IdentityStoreManager.cgi?generateKeyPair
- IdentityStoreName
~~~

# CVE

- [CVE-2020-12517](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2020-12517)
- [VDE CERT](https://cert.vde.com/en-us/advisories/vde-2020-049)
- [NVD](https://nvd.nist.gov/vuln/detail/CVE-2020-12517)

# CVSSv3.1 Base Score

CVSS Base Score: __8.8__

CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H

# Credit

Patrick Muench of [SVA System Vertrieb Alexander GmbH](https://www.sva.de)
Torsten Loebner of [SVA System Vertrieb Alexander GmbH](https://www.sva.de)
Pascal Keul of [SVA System Vertrieb Alexander GmbH](https://www.sva.de)
Maurice Rothe of [SVA System Vertrieb Alexander GmbH](https://www.sva.de)
Daniel Hackel of[SVA System Vertrieb Alexander GmbH](https://www.sva.de)

# Disclaimer

The information provided is released "as is" without warranty of any kind. The publisher disclaims all warranties, either express or implied, including all warranties of merchantability. No responsibility is taken for the correctness of this information. In no event shall the publisher be liable for any damages whatsoever including direct, indirect, incidental, consequential, loss of business profits or special damages, even if the publisher has been advised of the possibility of such damages.

The contents of this advisory are copyright (c) 2020 SVA System Vertrieb Alexander GmbH and may be distributed freely provided that no fee is charged for this distribution and proper credit is given.