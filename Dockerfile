FROM kbase/sdkbase2:python
MAINTAINER KBase Developer
# -----------------------------------------
# In this section, you can install any system dependencies required
# to run your App.  For instance, you could place an apt-get update or
# install line here, a git checkout to download code, or run any other
# installation scripts.

# RUN apt-get update

#RUN mkdir -p /opt/data
#RUN git clone https://github.com/ModelSEED/ModelSEEDDatabase.git /opt/data/ModelSEEDDatabase

RUN mkdir -p /opt/build
RUN git clone https://github.com/ModelSEED/modelseed-escher.git /opt/build/modelseed-escher

RUN pip install --upgrade pip


RUN pip install cobra
RUN pip install cobrakbase
RUN pip install /opt/build/modelseed-escher
RUN pip install networkx
# -----------------------------------------

COPY ./ /kb/module
RUN mkdir -p /kb/module/work
RUN chmod -R a+rw /kb/module

WORKDIR /kb/module

RUN python /kb/module/scripts/list_maps.py

RUN make all

ENTRYPOINT [ "./scripts/entrypoint.sh" ]

CMD [ ]
