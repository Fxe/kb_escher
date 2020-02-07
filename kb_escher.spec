/*
A KBase module: kb_escher
*/

module kb_escher {


    typedef int boolean;

    typedef structure {
        string map_name;
        string map_id;
        string map_description;
        string homepage;
        string schema; /* default: https://escher.github.io/escher/jsonschema/1-0-0# */
        list<string> authors;
    } EscherMapMetadata;
    
    typedef structure {
        string bigg_id;
        float coefficient;
    } EscherMapLayoutReactionMetabolite;
    
    typedef structure {
        float x;
        float y;
    } EscherMapLayout2DPoint;
    
    /*
        @optional b1 b2
    */
    typedef structure {
        string from_node_id;
        string to_node_id;
        EscherMapLayout2DPoint b1;
        EscherMapLayout2DPoint b2;
    } EscherMapLayoutReactionSegment;
    
    typedef structure {
        string bigg_id;
        string name;
        float label_x;
        float label_y;
        boolean reversibility;
        string gene_reaction_rule;
        list<EscherMapLayoutReactionMetabolite> metabolites;
        mapping<string, EscherMapLayoutReactionSegment> segments;
        list<string> genes;
    } EscherMapLayoutReaction;
    
    /*
        @optional bigg_id name label_x label_y node_is_primary
    */
    typedef structure {
        string node_type;
        float x;
        float y;
        string bigg_id;
        string name;
        float label_x;
        float label_y;
        boolean node_is_primary;
    } EscherMapLayoutNode;
    
    typedef structure {
        float x;
        float y;
        string text;
    } EscherMapLayoutLabel;
    
    typedef structure {
        float x;
        float y;
        float width;
        float height;
    } EscherMapLayoutCanvas;
    
    typedef structure {
        mapping<string, EscherMapLayoutReaction> reactions;
        mapping<string, EscherMapLayoutNode> nodes;
        mapping<string, EscherMapLayoutLabel> text_labels;
        EscherMapLayoutCanvas canvas;
    } EscherMapLayout;
    
    typedef structure {
        EscherMapMetadata metadata;
        EscherMapLayout layout;
    } EscherMap;
    
    typedef structure {
        string report_name;
        string report_ref;
    } ReportResults;
    
    /*
        This example function accepts any number of parameters and returns results in a KBaseReport
    */
    funcdef run_kb_escher(mapping<string,UnspecifiedObject> params) returns (ReportResults output) authentication required;
    
    funcdef run_kb_escher_pathway(mapping<string,UnspecifiedObject> params) returns (ReportResults output) authentication required;

};
