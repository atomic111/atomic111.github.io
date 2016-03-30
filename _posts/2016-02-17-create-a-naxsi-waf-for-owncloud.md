---
layout: post
title: "Create a NAXSI WAF for Owncloud"
date:   2016-02-17 19:00:00
image:
    url: /assets/images/cover.jpeg
video: false
comments: true
theme_color: 302F2D

author: 'Patrick Münch'
author_image: "https://avatars0.githubusercontent.com/u/7220740?s=400"
author_link: "https://twitter.com/atomiczero111"
---

# Introduction

A secure architecture of a web application consists of 3 components: a frontend, an application and a data backend. The frontend server's task from a security perspective is to terminate SSL and to be the first line of defense. That means it inspects and validates requests from the untrusted outside world.

Since 2011, the NAXSI module has become available, which quickly turns your nginx into a "Web Application Firewall" (WAF). Nginx with NAXSI can operate as a high-performance standalone WAF, if set up correctly.

NAXSI can filter different values like URLs, request parameters, cookies, headers, and/or the body of HTTP requests. Those values can be filtered separately as well as in combination. The NAXSI module can be enabled or disabled per location within the Nginx configuration.

NAXSI can be operated in two different modes: Live or learning. Some applications get very creative, with special characters encoded in cookies and other nasty tricks. This brings even experienced WAF admins quickly to the brink of insanity. The great learning feature in conjunction with automatic whitelisting puts you in the position to create WAF rules for any application and almost completely remove false-positives.

This article explains how to create a WAF for owncloud. Both the application as well as the WAF are completely deployed with docker containers. The following picture shows the application design:

![Application Design](http://atomic111.github.com/assets/article_images/2016-02-17-create-a-naxsi-waf-for-owncloud/design.png)

# Description of NAXSI Approach

NAXSI stands for "Nginx Anti Xss & Sql Injection". NAXSI WAF detects unexpected characters in HTTP requests/arguments and blocks these. It prevents an attacker from leveraging web vulnerabilities of a site, no matter in which language the website is developed. It protects the website from the [TOP 10 OWASP threats](https://www.owasp.org/index.php/Category:OWASP_Top_Ten_Project).

![Principle](http://atomic111.github.com/assets/article_images/2016-02-17-create-a-naxsi-waf-for-owncloud/principle.png)

The NXTOOL is helpful for the learning process. It writes all NAXSI events to elasticsearch. It also generates the whitelist.

The learning process is needed to identify "false positives" and prevent them. Without this phase, we run into the risk that applications end up not running at all. If we allow too much, however, we leave a window of exploitation for an external attacker. As you can see, the learning process is critical to the WAF's quality.

# Description of NAXSI Rules

NAXSI rules have a straightforward design: They consit of three basic types of rules. The MainRule defines a detection-pattern and scores. The BasicRule defines whitelists for a MainRule. The CheckRule defines actions when a score is met.

## MainRule

MainRule is an identifier which marks detection-rules, unlike BasicRules, which are usually used to whitelist certain MainRules.

![MainRule](http://atomic111.github.com/assets/article_images/2016-02-17-create-a-naxsi-waf-for-owncloud/mainrule.png)

### Match Pattern

The Match Pattern supports two formats:

* rx: regular expressions
* str: string matcher

String matcher are faster than regular expressions, which makes them the preferred pattern. This example uses a regular expression to search for the keyword `select|from` in the request.

### MSG

MSG is a human readable message and describes the pattern. This example includes the message `select and from sql keywords`

### Match Zone

Match zones defines which part of the request will be searched to find the specified pattern. This example rule searches in `BODY|URL|ARGS|$HEADERS_VAR:Cookie`. With this simple expression, it is easy to target the whole body. This includes the complete content and every variable name in the body. It also searches in the URL and in the request ARGS, including the complete content and every name of variable in its arguments. `$HEADERS_VAR:Cookie` means that NAXSI will also search in the HTTP "Cookie" header for the specified pattern.

### Score Section

s is the score section. It is a "named" counter and will increase the `SQL` counter by 4.

### ID

id is the ID of the rule. This example has the ID `1000`. Those IDs will be used in NAXSI_FMT and/or to whitelist this ID for a special request.

Further reading: [rules syntax](https://github.com/nbs-system/naxsi/wiki/rulessyntax)

## BasicRule

Basic Rules are used to create whitelists

![MainRule](http://atomic111.github.com/assets/article_images/2016-02-17-create-a-naxsi-waf-for-owncloud/basicrule.png)

### Whitelist

Which rule ID(s) are whitelisted. The example whitelists the rules 1011 and 1010 to allow special characters within the password field.

### Match Zone

Match zones defines which part of the request will be searched for the specified pattern (like for MainRules). This example rule searches in `$BODY_VAR:password` for the specified pattern. `$BODY_VAR:password` means NAXSI will search for the body variable named "password" for the specified pattern.

Further reading [whitelists](https://github.com/nbs-system/naxsi/wiki/whitelists)

# Start the owncloud and create NAXSI rules

First, we need to install docker and docker-compose. Then download the Project from [github](https://github.com/atomic111/example-NAXSI-owncloud.git) and just execute the `start.sh` bash script. It creates the data volume container for the Postgres database and for the Owncloud application. It also creates the Postgres container with default user/passwords (user=postgres and empty password) and creates Owncloud itself with the default user/password (user = admin, password = admin). **Not a good security practice. Sorry.** Let's focus on creating the WAF for owncloud.

The `start.sh` also creates the image and container for the NAXSI WAF. The container starts the WAF in LEARNING MODE and elasticsearch to store NAXSI events.

After the execution of `start.sh` it should look like this.

```bash
∅> docker ps --format "table {{.Names}}:\t{{.Ports}}"
NAMES                       PORTS
owncloud_waf_1:             0.0.0.0:443->443/tcp
owncloud_app_1:             80/tcp
owncloud_postgres_1:        5432/tcp
owncloud_elasticsearch_1:   9200/tcp, 9300/tcp
```

## Create the first NAXSI rule

Now the application is started and we have to browse the website to generate data in the logfile (`/var/log/nginx/naxsi_error.log`). Log into owncloud via your browser (`https://127.0.0.1`), upload a few pictures, create a folder, add a user, delete a file, delete a user, delete a group and click around. Create a lot of different events to prevent false-positives later on.

To log into the WAF, run `docker exec -it owncloud_waf_1 bash` and add a nxapi index to the elasticsearch database with the following command:

```bash
curl -XPUT 'http://elasticsearch:9200/nxapi/'
{"acknowledged":true}
```

Next, we need to load the data from the log file into ElasticSearch with the following command:

```bash
nxtool.py -c /etc/nginx/nxapi.json --files=/var/log/nginx/naxsi_error.log
# size :1000
WARNING:root:List of files :['/var/log/nginx/naxsi_error.log']
log open
{'date': '2016-02-16T14:29:33+00', 'events': [{'zone': 'HEADERS', 'ip': '127.0.0.1', 'uri': '/', 'server': '127.0.0.1', 'content': '', 'var_name': 'cookie', 'coords': [104.195397, 35.86166], 'country': 'CN', 'date': '2016-02-16T14:29:33+00', 'id': '1315'}]}
{'date': '2016-02-16T14:29:36+00', 'events': [{'zone': 'HEADERS', 'ip': '127.0.0.1', 'uri': '/index.php/apps/files/', 'server': '127.0.0.1', 'content': '', 'var_name': 'cookie', 'coords': [104.195397, 35.86166], 'country': 'CN', 'date': '2016-02-16T14:29:36+00', 'id': '1315'}]}

...

{'date': '2016-02-16T14:52:22+00', 'events': [{'zone': 'HEADERS', 'ip': '127.0.0.1', 'uri': '/index.php/heartbeat', 'server': '127.0.0.1', 'content': '', 'var_name': 'cookie', 'coords': [104.195397, 35.86166], 'country': 'CN', 'date': '2016-02-16T14:52:22+00', 'id': '1315'}, {'zone': 'BODY', 'ip': '127.0.0.1', 'uri': '/index.php/heartbeat', 'server': '127.0.0.1', 'content': '', 'var_name': '', 'coords': [104.195397, 35.86166], 'country': 'CN', 'date': '2016-02-16T14:52:22+00', 'id': '16'}]}
Written 710 events
root@18cecd3232a2:/opt#
```

The following command displays the top servers which raised the most exceptions. Also the top URIs and zones which raised exceptions are shown. We need the URI list to generate the whitelists for specific requests.  

```bash
nxtool.py -x -c /etc/nginx/nxapi.json
# size :1000
# Whitelist(ing) ratio :
# Top servers :
# 127.0.0.1 100.0% (total:710/710)
# Top URI(s) :
# /core/img/breadcrumb.svg 2.54% (total:18/710)
# /index.php/core/ajax/appconfig.php 2.39% (total:17/710)
# /index.php/settings/users/users 2.39% (total:17/710)
# /cron.php 2.25% (total:16/710)
# /index.php/core/js/oc.js 2.25% (total:16/710)
# /index.php/apps/notifications 2.11% (total:15/710)
# /index.php/avatar/admin/128 2.11% (total:15/710)
# /index.php/core/ajax/share.php 1.69% (total:12/710)
# /index.php/apps/files/ajax/getstoragestats.php 1.55% (total:11/710)
# /index.php/settings/users/groups 1.27% (total:9/710)
# /index.php/apps/files/ajax/upload.php 1.13% (total:8/710)
# Top Zone(s) :
# HEADERS 95.07% (total:675/710)
# URL 2.82% (total:20/710)
# BODY 1.69% (total:12/710)
# BODY|NAME 0.28% (total:2/710)
# ARGS 0.14% (total:1/710)
# Top Peer(s) :
# 127.0.0.1 100.0% (total:710/710)
root@18cecd3232a2:/opt#
```

Now generate a whitelist for the first URI and save the `BasicRule  wl:1315 "mz:$HEADERS_VAR:cookie";` in the `naxsi_whitelist.rules` file.

```bash
nxtool.py -c /etc/nginx/nxapi.json -s 127.0.0.1 -f --filter 'uri /core/img/breadcrumb.svg' --slack
# size :1000
#  template :/usr/local/nxapi/tpl/HEADERS/cookies.tpl
Nb of hits : 106
#  template matched, generating all rules.
1 whitelists ...
#Rule (1315) double encoding !
#total hits 106
#peers : 127.0.0.1
#uri : /core/img/breadcrumb.svg
#var_name : cookie

BasicRule  wl:1315 "mz:$HEADERS_VAR:cookie";
#  template :/usr/local/nxapi/tpl/BODY/url-wide-id.tpl
Nb of hits : 0
#  template :/usr/local/nxapi/tpl/BODY/url-wide-id-BODY-NAME.tpl
Nb of hits : 0
#  template :/usr/local/nxapi/tpl/BODY/precise-id.tpl
Nb of hits : 0
#  template :/usr/local/nxapi/tpl/BODY/var_name-wide-id.tpl
Nb of hits : 0
#  template :/usr/local/nxapi/tpl/BODY/site-wide-id.tpl
Nb of hits : 0
#  template :/usr/local/nxapi/tpl/ARGS/url-wide-id.tpl
Nb of hits : 0
#  template :/usr/local/nxapi/tpl/ARGS/url-wide-id-NAME.tpl
Nb of hits : 0
#  template :/usr/local/nxapi/tpl/ARGS/precise-id.tpl
Nb of hits : 0
#  template :/usr/local/nxapi/tpl/ARGS/site-wide-id.tpl
Nb of hits : 0
#  template :/usr/local/nxapi/tpl/APPS/google_analytics-ARGS.tpl
Nb of hits : 0
#  template :/usr/local/nxapi/tpl/URI/url-wide-id.tpl
Nb of hits : 0
#  template :/usr/local/nxapi/tpl/URI/global-url-0x_in_pircutres.tpl
Nb of hits : 0
#  template :/usr/local/nxapi/tpl/URI/site-wide-id.tpl
Nb of hits : 0
root@18cecd3232a2:/opt#
```
```bash
echo "BasicRule  wl:1315 \"mz:\$HEADERS_VAR:cookie\";" > /etc/nginx/naxsi_whitelist.rules  
```

Now tag the request with the corresponding rule inside elasticsearch.

```bash
nxtool.py -c /etc/nginx/nxapi.json -s 127.0.0.1 -w /etc/nginx/naxsi_whitelist.rules --tag         
# size :1000
#Loading tpl '/etc/nginx/naxsi_whitelist.rules'
TAG RULE :{'query': {'bool': {'must': [{'match': {'id': '1315'}},
                             {'match': {'zone': 'HEADERS'}},
                             {'match': {'var_name': 'cookie'}},
                             {'match': {u'whitelisted': u'false'}},
                             {'match': {'server': '127.0.0.1'}}]}},
 'size': '0'}
5151 items to be tagged ...
Tagged 515 events out of 5151
Tagged 1030 events out of 5151
Tagged 1545 events out of 5151
Tagged 2060 events out of 5151
Tagged 2575 events out of 5151
Tagged 3090 events out of 5151
Tagged 3605 events out of 5151
Tagged 4120 events out of 5151
Tagged 4635 events out of 5151
Tagged 5150 events out of 5151
Tagged 5151 events out of 5151

TAG RULE :{'from': 0,
 'query': {'bool': {'must': [{'match': {'id': '1315'}},
                             {'match': {'zone': 'HEADERS'}},
                             {'match': {'var_name': 'cookie'}},
                             {'match': {u'whitelisted': u'false'}},
                             {'match': {'server': '127.0.0.1'}}]}},
 'size': '0'}
178 items to be tagged ...
Tagged 17 events out of 178
Tagged 34 events out of 178
Tagged 51 events out of 178
Tagged 68 events out of 178
Tagged 85 events out of 178
Tagged 102 events out of 178
Tagged 119 events out of 178
Tagged 136 events out of 178
Tagged 153 events out of 178
Tagged 170 events out of 178
Tagged 178 events out of 178

TAG RULE :{'from': 0,
 'query': {'bool': {'must': [{'match': {'id': '1315'}},
                             {'match': {'zone': 'HEADERS'}},
                             {'match': {'var_name': 'cookie'}},
                             {'match': {u'whitelisted': u'false'}},
                             {'match': {'server': '127.0.0.1'}}]}},
 'size': '0'}
123 items to be tagged ...
Tagged 12 events out of 123
Tagged 24 events out of 123
Tagged 36 events out of 123
Tagged 48 events out of 123
Tagged 60 events out of 123
Tagged 72 events out of 123
Tagged 84 events out of 123
Tagged 96 events out of 123
Tagged 108 events out of 123
Tagged 120 events out of 123
Tagged 123 events out of 123

TAG RULE :{'from': 0,
 'query': {'bool': {'must': [{'match': {'id': '1315'}},
                             {'match': {'zone': 'HEADERS'}},
                             {'match': {'var_name': 'cookie'}},
                             {'match': {u'whitelisted': u'false'}},
                             {'match': {'server': '127.0.0.1'}}]}},
 'size': '0'}
99 items to be tagged ...
Tagged 99 events out of 99

TAG RULE :{'from': 0,
 'query': {'bool': {'must': [{'match': {'id': '1315'}},
                             {'match': {'zone': 'HEADERS'}},
                             {'match': {'var_name': 'cookie'}},
                             {'match': {u'whitelisted': u'false'}},
                             {'match': {'server': '127.0.0.1'}}]}},
 'size': '0'}
49 items to be tagged ...
Tagged 49 events out of 49

TAG RULE :{'from': 0,
 'query': {'bool': {'must': [{'match': {'id': '1315'}},
                             {'match': {'zone': 'HEADERS'}},
                             {'match': {'var_name': 'cookie'}},
                             {'match': {u'whitelisted': u'false'}},
                             {'match': {'server': '127.0.0.1'}}]}},
 'size': '0'}
0 items to be tagged ...

5600 items tagged ...
```

When you look to the report again, it will confirm, that the number of requests decreased

```bash
nxtool.py -x -c /etc/nginx/nxapi.json -s 127.0.0.1                                       
# size :1000
# Whitelist(ing) ratio :
# Top servers :
# 127.0.0.1 100.0% (total:424/424)
# Top URI(s) :
# /index.php/apps/files/ajax/upload.php 10.38% (total:44/424)
# /index.php/heartbeat 8.02% (total:34/424)
# /index.php/apps/files/ajax/delete.php 5.66% (total:24/424)
# /index.php/avatar/cropped 5.66% (total:24/424)
# /index.php/core/ajax/share.php 5.66% (total:24/424)
# /index.php/apps/gallery/files/list 4.95% (total:21/424)
# /index.php/core/ajax/appconfig.php 4.25% (total:18/424)
# /index.php/settings/apps/list 4.25% (total:18/424)
# /index.php/apps/files_trashbin/ajax/delete.php 3.77% (total:16/424)
# /core/css/multiselect.css 3.54% (total:15/424)
# /index.php/apps/gallery/thumbnails 3.54% (total:15/424)
# Top Zone(s) :
# URL 41.27% (total:175/424)
# BODY 30.42% (total:129/424)
# BODY|NAME 13.68% (total:58/424)
# ARGS 8.49% (total:36/424)
# ARGS|NAME 6.13% (total:26/424)
# Top Peer(s) :
# 127.0.0.1 100.0% (total:424/424)
```

## Create the second NAXSI rule

```bash
nxtool.py -c /etc/nginx/nxapi.json -s 127.0.0.1 -f --filter 'uri /index.php/apps/files/ajax/upload.php' --slack
# size :1000
#  template :/usr/local/nxapi/tpl/HEADERS/cookies.tpl
Nb of hits : 0
#  template :/usr/local/nxapi/tpl/BODY/url-wide-id.tpl
Nb of hits : 44
#  template matched, generating all rules.
1 whitelists ...
#msg: A generic whitelist, true for the whole uri
#Rule (2) request too big, stored on disk and not parsed
#total hits 44
#peers : 127.0.0.1
#uri : /index.php/apps/files/ajax/upload.php

BasicRule  wl:2 "mz:$URL:/index.php/apps/files/ajax/upload.php|BODY";
#  template :/usr/local/nxapi/tpl/BODY/url-wide-id-BODY-NAME.tpl
Nb of hits : 0
#  template :/usr/local/nxapi/tpl/BODY/precise-id.tpl
Nb of hits : 44
#  template matched, generating all rules.
1 whitelists ...
#msg: A generic, precise wl tpl (url+var+id)
#Rule (2) request too big, stored on disk and not parsed
#total hits 44
#peers : 127.0.0.1
#uri : /index.php/apps/files/ajax/upload.php

BasicRule  wl:2 "mz:$URL:/index.php/apps/files/ajax/upload.php|BODY";
#  template :/usr/local/nxapi/tpl/BODY/var_name-wide-id.tpl
Nb of hits : 44
#  template matched, generating all rules.
1 whitelists ...
#msg: A generic rule to spot var-name specific WL
#Rule (2) request too big, stored on disk and not parsed
#total hits 44
#peers : 127.0.0.1
#uri : /index.php/apps/files/ajax/upload.php

BasicRule  wl:2 "mz:BODY";
#  template :/usr/local/nxapi/tpl/BODY/site-wide-id.tpl
Nb of hits : 44
#  template matched, generating all rules.
1 whitelists ...
#msg: A generic, wide (id+zone) wl
#Rule (2) request too big, stored on disk and not parsed
#total hits 44
#peers : 127.0.0.1
#uri : /index.php/apps/files/ajax/upload.php

BasicRule  wl:2 "mz:BODY";
#  template :/usr/local/nxapi/tpl/ARGS/url-wide-id.tpl
Nb of hits : 0
#  template :/usr/local/nxapi/tpl/ARGS/url-wide-id-NAME.tpl
Nb of hits : 0
#  template :/usr/local/nxapi/tpl/ARGS/precise-id.tpl
Nb of hits : 0
#  template :/usr/local/nxapi/tpl/ARGS/site-wide-id.tpl
Nb of hits : 0
#  template :/usr/local/nxapi/tpl/APPS/google_analytics-ARGS.tpl
Nb of hits : 0
#  template :/usr/local/nxapi/tpl/URI/url-wide-id.tpl
Nb of hits : 0
#  template :/usr/local/nxapi/tpl/URI/global-url-0x_in_pircutres.tpl
Nb of hits : 0
#  template :/usr/local/nxapi/tpl/URI/site-wide-id.tpl
Nb of hits : 0
root@18cecd3232a2:/opt#
```

NXTOOL creates some rules for the same URI. The Main rule 2 protects against request which are to big and won´t be parsed. If we choose the `BasicRule  wl:2 "mz:BODY";`, we would allow for big requests on all URIs. That is not what we want. Instead, I recommend the `BasicRule  wl:2 "mz:$URL:/index.php/apps/files/ajax/upload.php|BODY";` because this rules allows only big requests for a specific URI.

Save the rule in the `naxsi_whitelist.rules`.

```bash
echo "BasicRule  wl:2 \"mz:\$URL:/index.php/apps/files/ajax/upload.php\|BODY\";" >> /etc/nginx/naxsi_whitelist.rules
```

Tag the request with the corresponding rule within elasticsearch.

```bash
nxtool.py -c /etc/nginx/nxapi.json -s 127.0.0.1 -w /etc/nginx/naxsi_whitelist.rules --tag                          
# size :1000
#Loading tpl '/etc/nginx/naxsi_whitelist.rules'
TAG RULE :{'query': {'bool': {'must': [{'match': {'id': '1315'}},
                             {'match': {'zone': 'HEADERS'}},
                             {'match': {'var_name': 'cookie'}},
                             {'match': {u'whitelisted': u'false'}},
                             {'match': {'server': '127.0.0.1'}}]}},
 'size': '0'}
0 items to be tagged ...

TAG RULE :{'query': {'bool': {'must': [{'match': {'id': '2'}},
                             {'match': {'uri': '/index.php/apps/files/ajax/upload.php'}},
                             {'match': {'zone': 'BODY'}},
                             {'match': {u'whitelisted': u'false'}},
                             {'match': {'server': '127.0.0.1'}}]}},
 'size': '0'}
44 items to be tagged ...
Tagged 44 events out of 44

TAG RULE :{'from': 0,
 'query': {'bool': {'must': [{'match': {'id': '2'}},
                             {'match': {'uri': '/index.php/apps/files/ajax/upload.php'}},
                             {'match': {'zone': 'BODY'}},
                             {'match': {u'whitelisted': u'false'}},
                             {'match': {'server': '127.0.0.1'}}]}},
 'size': '0'}
44 items to be tagged ...
Tagged 44 events out of 44

TAG RULE :{'from': 0,
 'query': {'bool': {'must': [{'match': {'id': '2'}},
                             {'match': {'uri': '/index.php/apps/files/ajax/upload.php'}},
                             {'match': {'zone': 'BODY'}},
                             {'match': {u'whitelisted': u'false'}},
                             {'match': {'server': '127.0.0.1'}}]}},
 'size': '0'}
0 items to be tagged ...

88 items tagged ...
root@18cecd3232a2:/opt#
```

Repeat these steps for all other requests until you get a complete whitelist similar to this:

```
BasicRule  wl:1000 "mz:$URL:/apps/activity/img/delete-color.svg|URL";
BasicRule  wl:1000 "mz:$URL:/apps/files/img/delete.svg|URL";
BasicRule  wl:1000 "mz:$URL:/apps/updater/css/updater.css|URL";
BasicRule  wl:1000 "mz:$URL:/apps/updater/img/app.svg|URL";
BasicRule  wl:1000 "mz:$URL:/apps/updater/js/3rdparty/angular.js|URL";
BasicRule  wl:1000 "mz:$URL:/apps/updater/js/updater.js|URL";
BasicRule  wl:1000 "mz:$URL:/apps/updater/l10n/de_DE.js|URL";
BasicRule  wl:1000 "mz:$URL:/core/css/multiselect.css|URL";
BasicRule  wl:1000 "mz:$URL:/core/img/actions/delete-hover.svg|URL";
BasicRule  wl:1000 "mz:$URL:/core/img/actions/delete.svg|URL";
BasicRule  wl:1000 "mz:$URL:/core/js/multiselect.js|URL";
BasicRule  wl:1000 "mz:$URL:/core/js/singleselect.js|URL";
BasicRule  wl:1000 "mz:$URL:/core/vendor/select2/select2-spinner.gif|URL";
BasicRule  wl:1000 "mz:$URL:/core/vendor/select2/select2.css|URL";
BasicRule  wl:1000 "mz:$URL:/core/vendor/select2/select2.js|URL";
BasicRule  wl:1000 "mz:$URL:/core/vendor/select2/select2.png|URL";
BasicRule  wl:1000 "mz:$URL:/index.php/apps/activity/settings|BODY|NAME";
BasicRule  wl:1000 "mz:$URL:/index.php/apps/files/ajax/delete.php|URL";
BasicRule  wl:1000 "mz:$URL:/index.php/apps/files_trashbin/ajax/delete.php|URL";
BasicRule  wl:1000 "mz:$URL:/index.php/apps/files_trashbin/ajax/undelete.php|URL";
BasicRule  wl:1000 "mz:$URL:/index.php/apps/updater/backup/index|URL";
BasicRule  wl:1000 "mz:$URL:/index.php/settings/apps/list|ARGS|NAME";
BasicRule  wl:1000 "mz:$URL:/settings/js/users/deleteHandler.js|URL";
BasicRule  wl:1000 "mz:$URL:/settings/js/users/deleteHandler.js|URL";
BasicRule  wl:1000 "mz:$URL:/index.php/apps/files/ajax/scan.php|$ARGS_VAR:requesttoken";
BasicRule  wl:1001,1310,1311 "mz:$URL:/index.php/apps/files/ajax/delete.php|$BODY_VAR:files";
BasicRule  wl:1001,1310,1311 "mz:$URL:/index.php/apps/files_trashbin/ajax/delete.php|$BODY_VAR:files";
BasicRule  wl:1001,1310,1311 "mz:$URL:/index.php/apps/files_trashbin/ajax/undelete.php|$BODY_VAR:files";
BasicRule  wl:1001,1310,1311 "mz:$URL:/index.php/core/ajax/appconfig.php|$BODY_VAR:value";
BasicRule  wl:1002 "mz:$URL_X:/core/css/images|URL";
BasicRule  wl:1002 "mz:$URL:/index.php/core/preview.png|$HEADERS_VAR:cookie";
BasicRule  wl:1002 "mz:$URL:/index.php/core/ajax/appconfig.php|$HEADERS_VAR:cookie";
BasicRule  wl:1002 "mz:$URL:/index.php/core/ajax/share.php|$HEADERS_VAR:cookie";
BasicRule  wl:1002 "mz:$URL:/index.php/core/js/oc.js|$HEADERS_VAR:cookie";
BasicRule  wl:1002 "mz:$URL:/core/img/breadcrumb.svg|$HEADERS_VAR:cookie";
BasicRule  wl:1002 "mz:$URL:/index.php/apps/notifications|$HEADERS_VAR:cookie";
BasicRule  wl:1002 "mz:$URL_X:/index.php/avatar|$HEADERS_VAR:cookie";
BasicRule  wl:1002 "mz:$URL_X:/index.php/apps/files_trashbin/ajax|$HEADERS_VAR:cookie";
BasicRule  wl:1002 "mz:$URL:/index.php/apps/files/ajax/getstoragestats.php|$HEADERS_VAR:cookie";
BasicRule  wl:1002 "mz:$URL:/cron.php|$HEADERS_VAR:cookie";
BasicRule  wl:1005 "mz:$URL:/index.php/core/ajax/share.php|$BODY_VAR:sharewith[password]";
BasicRule  wl:1008 "mz:$URL:/index.php/apps/gallery/files/list|$ARGS_VAR:mediatypes";
BasicRule  wl:1008 "mz:$URL:/index.php/apps/gallery/thumbnails|$ARGS_VAR:ids";
BasicRule  wl:1008 "mz:$URL:/index.php/apps/galleryplus/files/list|$ARGS_VAR:mediatypes";
BasicRule  wl:1008 "mz:$URL:/index.php/apps/galleryplus/thumbnails|$ARGS_VAR:ids";
BasicRule  wl:1009 "mz:$URL:/index.php/apps/files_pdfviewer/|$ARGS_VAR:file";
BasicRule  wl:1009 "mz:$URL:/|$BODY_VAR:requesttoken";
BasicRule  wl:1009 "mz:$URL:/index.php|$ARGS_VAR:requesttoken";
BasicRule  wl:1001,1009,1010,1011,1310,1311 "mz:$URL:/index.php/settings/personal/changepassword|$BODY_VAR:oldpassword";
BasicRule  wl:1001,1009,1010,1011,1310,1311 "mz:$URL:/index.php/settings/personal/changepassword|$BODY_VAR:personal-password";
BasicRule  wl:1001,1009,1010,1011,1310,1311 "mz:$URL:/index.php/settings/personal/changepassword|$BODY_VAR:personal-password-clone";
BasicRule  wl:1001,1009,1010,1011,1310,1311 "mz:$URL:/index.php/settings/users/users|$BODY_VAR:password";
BasicRule  wl:1001,1009,1010,1011,1310,1311 "mz:$URL:/|$BODY_VAR:password";
BasicRule  wl:1302,1303 "mz:$URL:/index.php/apps/files/api/v1/tags/_$!<Favorite>!$_/files|URL";
BasicRule  wl:1310,1311 "mz:$URL:/index.php/avatar/cropped|BODY|NAME";
BasicRule  wl:1310,1311 "mz:$URL:/index.php/core/ajax/share.php|ARGS|NAME";
BasicRule  wl:1310,1311 "mz:$URL:/index.php/core/ajax/share.php|BODY|NAME";
BasicRule  wl:1310,1311 "mz:$URL:/index.php/settings/users/users|BODY|NAME";
BasicRule  wl:1311,1310,1011 "mz:$URL:/index.php/settings/users/users|BODY|NAME";
BasicRule  wl:1315 "mz:$HEADERS_VAR:cookie";
BasicRule  wl:1315 "mz:$URL:/index.php/apps/files_pdfviewer/|$ARGS_VAR:file";
BasicRule  wl:16 "mz:$URL:/index.php/heartbeat|BODY";
BasicRule  wl:2 "mz:$URL:/index.php/apps/files/ajax/upload.php|BODY";
BasicRule  wl:2 "mz:$URL:/index.php/avatar/|BODY";
BasicRule wl:17 "mz:$URL_X:/remote.php/webdav|$HEADERS_VAR:Accept"; #wl libinjection_sql on header
```

Save this whitelist to `waf/naxsi_whitelist.rules` in the project's folder. Change the `docker-compose.yml` to disable learning mode of NAXSI and switch over to LIVE mode.

```bash
waf:
    build: ./waf
    depends_on:
      - app
      - elasticsearch
    links:
      - app:owncloud
      - elasticsearch:elasticsearch
    environment:
      - LEARNING_MODE=no
      - PROXY_REDIRECT_IP=owncloud
    ports:
      - "443:443"
    networks:
      - frontend
      - backend_app
```

Run `docker rm -f owncloud_waf_1` to shutdown and remove the running WAF container. Execute `docker-compose -p owncloud build` to create a new image which includes the new `naxsi_whitelist.rules`. Start it via `docker-compose -p owncloud up -d`

## Test the NAXSI WAF

Watch the log file from the `owncloud_waf_1` docker container.

```bash
∅> docker exec -it owncloud_waf_1 tail -f /var/log/nginx/naxsi_error.log
```

Go to the owncloud login page and put `user’ or 1=1;#` as username and password in the fields. Now you should see an error message in the NAXSI log file.

```bash
2016/03/30 09:30:39 [error] 15#0: *389 NAXSI_FMT: ip=127.0.0.1&server=127.0.0.1&uri=/&learning=0&vers=0.55rc1&total_processed=112&total_blocked=2&block=1&cscore0=$SQL&score0=4&cscore1=$XSS&score1=8&zone0=BODY&id0=1008&var_name0=user, client: 127.0.0.1, server: owncloud_naxsi, request: "POST / HTTP/1.0", host: "127.0.0.1:8080"
```

**It's working. Have FUN!!!**

# To Do's

* Write permanant NAXSI events to elasticsearch
* Clean NAXSI logs
* Use Kibana for visualization
* Clean rules

# Links

Thanks for the useful information on those websites

[NBS-System Blog](https://www.nbs-system.co.uk/blog-2/naxsi-web-application-firewall-for-nginx.html)

[NBS-System](https://github.com/nbs-system/naxsi)

[NAXSI - Users - Manual](https://www.mare-system.de/blog/page/1365686359/)

[Admin Magazin](http://www.admin-magazin.de/Das-Heft/2013/03/Nginx-als-Frontend-Gateway-mit-Naxsi-Firewall/%28offset%29/6)

[NAXSI Rules](http://spike.nginx-goodies.com/rules/)

## License and Author

* Author:: Patrick Muench <patrick.muench1111@gmail.com>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
