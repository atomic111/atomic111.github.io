---
layout: post
title: "CVE-2019-12825: Unauthorized Access to Container Registry of other groups"
date:   2020-02-10 22:00:00
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

- Vendor: GitLab Inc.
- Product: gitlab Enterprise (gitlab.com)
- Version: 12.0.0-pre
- Vulnerability: Relected Cross-Site Scripting
- Fixed Version: 12.5

# Background

itLab provides a Git-repository manager with on top services and tools like a web-based DevOps lifecycle tool, wiki, issue-tracking and CI/CD pipeline features. GitLab is using an open-source license and developed by GitLab Inc.

From the vendor's website:
"GitLab is the first single application for the entire DevOps lifecycle. From planning to monitoring GitLab covers every stage and additionally lets you manage and secure across stages. Only GitLab enables Concurrent DevOps, unlocking organizations from the constraints of the toolchain. GitLab provides unmatched visibility, higher levels of efficiency, and comprehensive governance. This makes the software lifecycle 200% faster, radically improving the speed of business."

# Issue Description

When a user changes the path of a group in gitlab, Docker registries are not adapted, leaving them in the old namespace. They are not protected and are available to all other users with no previous access to the repo.

The following steps illustrate the inadequate access control to docker registry:

- create two gitlab user (pentest1, pentest2) with ssh keys

~~~ text
username = pentest1
mail = pentest1@groupofdestruction.de
pw = ...[SNIP]...

username = pentest2
mail = pentest2@groupofdestruction.de
pw = ...[SNIP]...
~~~

- Login as user pentest1
- Go to [https://gitlab.com/dashboard/groups?nav_source=navbar](https://gitlab.com/dashboard/groups?nav_source=navbar)
- Create a new group with user pentest1 [https://gitlab.com/groups/new](https://gitlab.com/groups/new ) called grouppentest1 with private as default selection
- Create a new private project with name trial1 in group grouppentest1
- Go to [https://gitlab.com/grouppentest1/trial1](https://gitlab.com/grouppentest1/trial1)
- Create a new file .gitlab-ci.yml [https://gitlab.com/grouppentest1/trial1/new/master](https://gitlab.com/grouppentest1/trial1/new/master) with the content located in this repo

~~~ text
build:docker:
stage: build
image: docker:18
services:
  - docker:dind
before_script:
  - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD \
    $CI_REGISTRY
script:
  - docker pull centos:7
  - docker pull centos:6
  - docker pull oraclelinux:7
  - docker tag docker.io/centos:7 $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA
  - docker tag docker.io/centos:7 $CI_REGISTRY_IMAGE:$CI_COMMIT_REF_NAME
  - docker tag docker.io/centos:6 $CI_REGISTRY_IMAGE:2.12.1
  - docker tag docker.io/oraclelinux:7 $CI_REGISTRY_IMAGE:2.13.1

  - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA
  - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_REF_NAME
  - docker push $CI_REGISTRY_IMAGE:2.12.1
  - docker push $CI_REGISTRY_IMAGE:2.13.1
~~~

- Wait until CI is done and go to [https://gitlab.com/grouppentest1/trial1/container_registry](https://gitlab.com/grouppentest1/trial1/container_registry) and you should see the published repos
- Go to group management [https://gitlab.com/groups/grouppentest1/-/edit](https://gitlab.com/groups/grouppentest1/-/edit) and change groupname to grouppentest2 and path to grouppentest2
- Project registry does not show any container [https://gitlab.com/grouppentest1/trial1/container_registry](https://gitlab.com/grouppentest1/trial1/container_registry)
- Logout as user pentest1
- Login with user pentest2
- Create a new group called grouppentest1
- Create a new project called trial1
- See docker images from previous user pentest1

# CVE

[CVE-2019-12825](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-12825)

# CVSSv3 Base Score

CVSS Base Score: __5.9__

CVSS:3.0/AV:N/AC:H/PR:L/UI:N/S:U/C:H/I:N/A:N

# Credit

Patrick Muench of [SVA System Vertrieb Alexander GmbH](https://www.sva.de)

Christoph Hartmann of [Mondoo, Inc.](https://mondoo.io/)

# Disclaimer

The information provided is released "as is" without warranty of any kind. The publisher disclaims all warranties, either express or implied, including all warranties of merchantability. No responsibility is taken for the correctness of this information. In no event shall the publisher be liable for any damages whatsoever including direct, indirect, incidental, consequential, loss of business profits or special damages, even if the publisher has been advised of the possibility of such damages.

The contents of this advisory are copyright (c) 2019 Mondoo, Inc. & SVA System Vertrieb Alexander GmbH and may be distributed freely provided that no fee is charged for this distribution and proper credit is given.