/*
A KBase module: kb_escher
*/

module kb_escher {
    typedef structure {
        string report_name;
        string report_ref;
    } ReportResults;

    /*
        This example function accepts any number of parameters and returns results in a KBaseReport
    */
    funcdef run_kb_escher(mapping<string,UnspecifiedObject> params) returns (ReportResults output) authentication required;

};
