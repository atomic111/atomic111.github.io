---
layout: post
title: "Downloading Firmware via Plain HTTP in HomeMatic CCU2"
date:   2018-02-21 19:40:00
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

While analyzing the CCU2 software, it was found that the system's crontab file contains an entry for invoking the script `/usr/local/etc/config/addons/mh/loopupd.sh` on a regular basis. This script contains the following code:

```
ADDONDIR=/usr/local/etc/config/addons/mh

#altes Schluessel-Paket loeschen
v1=`rm $ADDONDIR/vpnkey_ccu2.tar.gz`
v1b=`rm $ADDONDIR/newver`
#
#das Paket des Benutzers herunter laden
v2=`/usr/bin/wget -O $ADDONDIR/newver 'http://www.meine-homematic.de/getverv2.php?id=29294&key=s35m89s3k73e19y7' -q`
#
```

It can be observed that software update packages are downloaded via the HTTP protocol, which does not provide any cryptographic protection of the downloaded contents. An attacker with a privileged network position (which could be obtained via DNS spoofing or other approaches) can exploit this issue in order to provide arbitrary malicious firmware updates to the CCU2. This can result in a full system compromise.

# Credit

Gregor Kopf of [Secfault Security GmbH](https://secfault-security.com)

Patrick Muench of [SVA Systemvertrieb Alexander GmbH](https://www.sva.de)

# Disclaimer

The information provided is released "as is" without warranty of any kind. The publisher disclaims all warranties, either express or implied, including all warranties of merchantability. No responsibility is taken for the correctness of this information. In no event shall the publisher be liable for any damages whatsoever including direct, indirect, incidental, consequential, loss of business profits or special damages, even if the publisher has been advised of the possibility of such damages.

The contents of this advisory are copyright (c) 2017 Secfault Security GmbH & SVA System Vertrieb Alexander GmbH and may be distributed freely provided that no fee is charged for this distribution and proper credit is given.
