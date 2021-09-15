# -*- coding: utf-8 -*-
#BEGIN_HEADER
import logging
import os
import json
import math
import uuid
import shutil

import escher
import cobrakbase
from modelseedpy_escher import EscherManager

from kb_escher.utils import mkdir_p
from kb_escher.kb_escher_app import KBaseEscher

from installed_clients.KBaseReportClient import KBaseReport
from installed_clients.DataFileUtilClient import DataFileUtil
from installed_clients.WorkspaceClient import Workspace
#END_HEADER


class kb_escher:
    '''
    Module Name:
    kb_escher

    Module Description:
    A KBase module: kb_escher
    '''

    ######## WARNING FOR GEVENT USERS ####### noqa
    # Since asynchronous IO can lead to methods - even the same method -
    # interrupting each other, you must be *very* careful when using global
    # state. A method could easily clobber the state set by another while
    # the latter method is running.
    ######################################### noqa
    VERSION = "0.0.1"
    GIT_URL = "git@github.com:Fxe/kb_escher.git"
    GIT_COMMIT_HASH = "2d573f86bb000684b9216c5063786f873d220c09"

    #BEGIN_CLASS_HEADER
    #END_CLASS_HEADER

    # config contains contents of config file in a hash or None if it couldn't
    # be found
    def __init__(self, config):
        #BEGIN_CONSTRUCTOR
        self.callback_url = os.environ['SDK_CALLBACK_URL']
        self.shared_folder = config['scratch']
        self.ws_url = config['workspace-url']
        self.dfu = DataFileUtil(self.callback_url)
        
        logging.basicConfig(format='%(created)s %(levelname)s: %(message)s',
                            level=logging.INFO)
        #END_CONSTRUCTOR
        pass


    def run_kb_escher(self, ctx, params):
        """
        This example function accepts any number of parameters and returns results in a KBaseReport
        :param params: instance of mapping from String to unspecified object
        :returns: instance of type "ReportResults" -> structure: parameter
           "report_name" of String, parameter "report_ref" of String
        """
        # ctx is the context object
        # return variables are: output
        #BEGIN run_kb_escher
        ws = params['workspace_name']
        print(params)
        
        output_directory = os.path.join(self.shared_folder, str(uuid.uuid4()))
        mkdir_p(output_directory)
        
        print('output_directory', output_directory, os.listdir(output_directory))
        shutil.copytree('/kb/module/data/html', output_directory + '/report')
        
        print(output_directory)
        
        shock_id = self.dfu.file_to_shock({
            'file_path': output_directory + '/report',
            'pack': 'zip'
        })['shock_id']
        
        html_report = []
        html_report.append({
            'shock_id': shock_id,
            'name': 'index.html',
            'label': 'HTML Report',
            'description': 'Escher Pathway Explorer'
        })
        
        report = KBaseReport(self.callback_url)
        
        report_params = {
            'message': 'message_in_app ' + output_directory,
            'warnings': ['example warning'],
            'workspace_name': ws,
            'objects_created': [],
            'html_links': html_report,
            'direct_html_link_index': 0,
            'html_window_height': int(params['report_height']),
        }
        
        report_info = report.create_extended_report(report_params)
        
        output = {
            'report_name': report_info['name'], 
            'report_ref': report_info['ref']
        }
        #END run_kb_escher

        # At some point might do deeper type checking...
        if not isinstance(output, dict):
            raise ValueError('Method run_kb_escher return value ' +
                             'output is not type dict as required.')
        # return the results
        return [output]

    def run_kb_escher_pathway(self, ctx, params):
        """
        :param params: instance of mapping from String to unspecified object
        :returns: instance of type "ReportResults" -> structure: parameter
           "report_name" of String, parameter "report_ref" of String
        """
        # ctx is the context object
        # return variables are: output
        #BEGIN run_kb_escher_pathway
        ws = params['workspace_name']
        print(params)
        api = cobrakbase.KBaseAPI(ctx['token'], config={'workspace-url' : self.ws_url})
        escher_seed = EscherManager(escher)
        
        kb_escher = KBaseEscher(params, api, escher_seed)
        
        kb_escher.build()
        kb_escher.export()
        
        output_directory = os.path.join(self.shared_folder, str(uuid.uuid4()))
        mkdir_p(output_directory)
        
        print('output_directory', output_directory, os.listdir(output_directory))
        shutil.copytree('/kb/module/data/html', output_directory + '/report')
        
        print(output_directory)
        
        shock_id = self.dfu.file_to_shock({
            'file_path': output_directory + '/report',
            'pack': 'zip'
        })['shock_id']
        
        html_report = []
        html_report.append({
            'shock_id': shock_id,
            'name': 'index.html',
            'label': 'HTML Report',
            'description': 'Escher Pathway Map'
        })
        
        report = KBaseReport(self.callback_url)
        
        report_params = {
            'message': 'message_in_app ' + output_directory,
            'warnings': ['example warning'],
            'workspace_name': ws,
            'objects_created': [],
            'html_links': html_report,
            'direct_html_link_index': 0,
            'html_window_height': int(params['report_height']),
        }
        
        report_info = report.create_extended_report(report_params)
        
        output = {
            'report_name': report_info['name'], 
            'report_ref': report_info['ref']
        }
        
        #END run_kb_escher_pathway

        # At some point might do deeper type checking...
        if not isinstance(output, dict):
            raise ValueError('Method run_kb_escher_pathway return value ' +
                             'output is not type dict as required.')
        # return the results
        return [output]
    def status(self, ctx):
        #BEGIN_STATUS
        returnVal = {'state': "OK",
                     'message': "",
                     'version': self.VERSION,
                     'git_url': self.GIT_URL,
                     'git_commit_hash': self.GIT_COMMIT_HASH}
        #END_STATUS
        return [returnVal]
