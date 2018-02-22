---
layout: post
title: "CVE-2018-7299: Untrusted Addon Installation / Remote Code Execution in HomeMatic CCU2"
date:   2018-02-21 17:00:00
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

While analyzing the implementation of the CCU2's web interface, in particular the addon installation process and how to build own addon-packages, a remote code execution vulnerability has been identified.

An authenticated user can upload addon packages, which contain an update_script file. This update_script file will be executed during the addon installation process. This means that an attacker can create or overwrite arbitrary files or install malicious software.

This vulnerability can be exploited in order to execute arbitrary code on the system. An attacker can for instance overwrite the `/usr/local/crontabs/root` crontab in order to reach this goal.

This can in particular be problematic if users install untrusted addons from remote sources. It might be advisable to introduce a signing scheme for trusted addons and to warn the user in case they install untrusted or unsigned addons, which could contain malicious code.

Procedure:

- Create a file named update_script containing malicious code
- Pack the addon package
- Upload the addon package via the Homematic CCU2 web interface

# CVE

[CVE-2018-7299](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2014-7299)

# Credit

Patrick Muench of [SVA Systemvertrieb Alexander GmbH](https://www.sva.de)

Gregor Kopf of [Secfault Security GmbH](https://secfault-security.com)

# Disclaimer

The information provided is released "as is" without warranty of any kind. The publisher disclaims all warranties, either express or implied, including all warranties of merchantability. No responsibility is taken for the correctness of this information. In no event shall the publisher be liable for any damages whatsoever including direct, indirect, incidental, consequential, loss of business profits or special damages, even if the publisher has been advised of the possibility of such damages.

The contents of this advisory are copyright (c) 2017 Secfault Security GmbH & SVA System Vertrieb Alexander GmbH and may be distributed freely provided that no fee is charged for this distribution and proper credit is given.
