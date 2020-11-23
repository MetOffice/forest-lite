
Getting started
---------------

The command line interface to FOREST-Lite needs a lot of
care and attention since the deployed version doesn't use it
directly.

AWS EC2 usage
=============

A command similar to the following is run inside a Docker container
on EC2 behind an NGINX load balancer to deploy FOREST-Lite.

```dockerfile
ENV CONFIG_FILE=/path/to/config.yaml
ENV DB_FILE=/path/to/config-users.yaml
ENV BASE_URL=.
ENV NEARCAST_DIR=/path/to/nearcast
ENV SECRET_KEY=fake_key
CMD python /path/to/server/main.py --port=8080
```

User database
=============

A user database can be prepared using a helper
command

```bash
forest_lite database --help
```

Command line interface
======================

The command line interface needs to be
upgraded to perform the same tasks as the deployed AWS EC2
configuration.

