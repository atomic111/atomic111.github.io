---
layout: post
title: "CVE-2018-7300: Arbitrary File Upload / Remote Code Execution in HomeMatic CCU2"
date:   2018-02-21 18:25:00
image:
      url: /assets/article_images/2016-05-30-inspec-cis-docker/cover.jpeg
video: false
comments: true
theme_color: 302F2D

author: 'Patrick Münch'

author_image: "https://avatars0.githubusercontent.com/u/7220740?s=400"
author_link: "https://twitter.com/atomiczero111"
---

# Background

HomeMatic is a home automation system consisting of various components for automating several parts of a building, including different sensors and actuators. The HomeMatic CCU2 is a central control unit, which is responsible for integrating these components with each other.

From the vendor's website ([eQ-3](http://www.eq-3.de/produkte/homematic/zentralen-und-gateways.html)):

"The Homematic Central Control Unit CCU2 is responsible for numerous control, signalling and supervision functions across all areas of the Homematic system. The device includes a browser based user interface to the up the system. It can be controlled in the local network as well as via Internet. The Homematic software offers various configuration and application possibilities, so that there are no limits to creativity for installing your individual smart home."

# Issue Description

While analyzing the implementation of the CCU2's web interface, one Directory Traversal vulnerabilities has been identified, which can be exploited in order to write arbitrary files to the CCU2's filesystem. This vulnerability can be exploited by unauthenticated attackers with access to the web interface.

The system provides a JSON API, which exposes various methods. While some methods require the connecting user to be authenticated, a number of methods can also be used anonymously.

A code review of the file `api/methods/user/setlanguage.tcl` revealed that the User.setLanguage method, which can be used without authentication, is prone to a Directory Traversal vulnerability. Please consider the following excerpt from the affected code:

```
exec echo $args(userLang)>/etc/config/userprofiles/$args(userName).lang
```

This means that an attacker can create or overwrite arbitrary files on the CCU2's filesystem. Please note that full control over the target file name can be obtained by injecting a null byte into the userName argument in order to prevent the string ".lang" from being appended to the resulting file name. The file contents can be directly controlled via the userLang argument.

# CVE

[CVE-2018-7300](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2018-7300)

# Credit

Gregor Kopf of [Secfault Security GmbH](https://secfault-security.com)

Patrick Muench of [SVA System Vertrieb Alexander GmbH](https://www.sva.de)

# Disclaimer

The information provided is released "as is" without warranty of any kind. The publisher disclaims all warranties, either express or implied, including all warranties of merchantability. No responsibility is taken for the correctness of this information. In no event shall the publisher be liable for any damages whatsoever including direct, indirect, incidental, consequential, loss of business profits or special damages, even if the publisher has been advised of the possibility of such damages.

The contents of this advisory are copyright (c) 2017 Secfault Security GmbH & SVA System Vertrieb Alexander GmbH and may be distributed freely provided that no fee is charged for this distribution and proper credit is given.
