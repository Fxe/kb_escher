FROM kbase/sdkbase2:python
MAINTAINER KBase Developer
# -----------------------------------------
# In this section, you can install any system dependencies required
# to run your App.  For instance, you could place an apt-get update or
# install line here, a git checkout to download code, or run any other
# installation scripts.

RUN apt-get update
RUN apt-get install -y g++

#RUN mkdir -p /opt/data
#RUN git clone https://github.com/ModelSEED/ModelSEEDDatabase.git /opt/data/ModelSEEDDatabase

RUN pip install --upgrade pip

RUN rm -rf /miniconda/lib/python3.6/site-packages/ruamel*
RUN pip install cobra==0.19.0
RUN pip install networkx

RUN mkdir -p /opt/build
RUN git clone https://github.com/Fxe/cobrakbase.git /opt/build/cobrakbase
RUN git clone https://github.com/ModelSEED/ModelSEEDpy-Escher.git /opt/build/ModelSEEDpy-Escher
RUN git clone https://github.com/ModelSEED/ModelSEEDpy.git /opt/build/ModelSEEDpy

RUN pip install /opt/build/ModelSEEDpy
RUN pip install /opt/build/cobrakbase
RUN pip install /opt/build/ModelSEEDpy-Escher

# -----------------------------------------
RUN mkdir -p /kb/module/data/html/data/map_base
RUN mkdir -p /kb/module/data/html/data/map_model
RUN mkdir -p /kb/module/data/html/data/datasets
RUN mkdir -p /kb/module/data/html/data/models
RUN mkdir -p /root/.cache/escher/1-0-0/5/maps/ModelSEED
COPY maps/ModelSEED /root/.cache/escher/1-0-0/5/maps/ModelSEED

COPY ./ /kb/module
RUN mkdir -p /kb/module/work
RUN chmod -R a+rw /kb/module

WORKDIR /kb/module

RUN python /kb/module/scripts/list_maps.py

RUN make all

ENTRYPOINT [ "./scripts/entrypoint.sh" ]

CMD [ ]
