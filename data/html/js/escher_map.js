var _pj;
function _pj_snippets(container) {
    function in_es6(left, right) {
        if (((right instanceof Array) || ((typeof right) === "string"))) {
            return (right.indexOf(left) > (- 1));
        } else {
            if (((right instanceof Map) || (right instanceof Set) || (right instanceof WeakMap) || (right instanceof WeakSet))) {
                return right.has(left);
            } else {
                return (left in right);
            }
        }
    }
    container["in_es6"] = in_es6;
    return container;
}
_pj = {};
_pj_snippets(_pj);
class EscherMap {
    constructor(escher_map) {
        this.escher_map = escher_map;
        this.escher_graph = escher_map[1];
        this.escher_data = escher_map[0];
    }
    get_next_id() {
        var next_id;
        next_id = 0;
        for (var node_id, _pj_c = 0, _pj_a = this.escher_graph["nodes"], _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            node_id = _pj_a[_pj_c];
            if ((Number.parseInt(node_id) >= next_id)) {
                next_id = (Number.parseInt(node_id) + 1);
            }
        }
        return next_id;
    }
    swap_ids(cpd_remap, rxn_remap) {
        var map_reaction, node;
        for (var map_uid, _pj_c = 0, _pj_a = this.escher_graph["nodes"], _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            map_uid = _pj_a[_pj_c];
            node = this.escher_graph["nodes"][map_uid];
            if (((node["node_type"] === "metabolite") && _pj.in_es6(node["bigg_id"], cpd_remap))) {
                node["bigg_id"] = cpd_remap[node["bigg_id"]];
            }
        }
        for (var map_uid, _pj_c = 0, _pj_a = this.escher_graph["reactions"], _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            map_uid = _pj_a[_pj_c];
            map_reaction = this.escher_graph["reactions"][map_uid];
            if (_pj.in_es6(map_reaction["bigg_id"], rxn_remap)) {
                map_reaction["bigg_id"] = rxn_remap[map_reaction["bigg_id"]];
            }
            for (var m, _pj_f = 0, _pj_d = map_reaction["metabolites"], _pj_e = _pj_d.length; (_pj_f < _pj_e); _pj_f += 1) {
                m = _pj_d[_pj_f];
                if (_pj.in_es6(m["bigg_id"], cpd_remap)) {
                    m["bigg_id"] = cpd_remap[m["bigg_id"]];
                }
            }
        }
    }
    add_uid_to_reaction_metabolites() {
        var bigg_id, from_node, from_node_id, met_id_to_uid, node, node_uid_map, rnode, s, to_node, to_node_id;
        node_uid_map = {};
        for (var node_uid, _pj_c = 0, _pj_a = this.escher_graph["nodes"], _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            node_uid = _pj_a[_pj_c];
            node = this.escher_graph["nodes"][node_uid];
            if ((node["node_type"] === "metabolite")) {
                bigg_id = node["bigg_id"];
                if ((! _pj.in_es6(bigg_id, node_uid_map))) {
                    node_uid_map[bigg_id] = set();
                }
                node_uid_map[bigg_id].add(node_uid);
            }
        }
        for (var node_uid, _pj_c = 0, _pj_a = this.escher_graph["reactions"], _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            node_uid = _pj_a[_pj_c];
            rnode = this.escher_graph["reactions"][node_uid];
            met_id_to_uid = {};
            for (var s_uid, _pj_f = 0, _pj_d = rnode["segments"], _pj_e = _pj_d.length; (_pj_f < _pj_e); _pj_f += 1) {
                s_uid = _pj_d[_pj_f];
                s = rnode["segments"][s_uid];
                from_node_id = rnode["segments"][s_uid]["from_node_id"];
                to_node_id = rnode["segments"][s_uid]["to_node_id"];
                from_node = this.escher_graph["nodes"][from_node_id];
                to_node = this.escher_graph["nodes"][to_node_id];
                if ((from_node["node_type"] === "metabolite")) {
                    if ((! _pj.in_es6(from_node["bigg_id"], met_id_to_uid))) {
                        met_id_to_uid[from_node["bigg_id"]] = from_node_id;
                    } else {
                        console.log("!!!", from_node["bigg_id"]);
                    }
                }
                if ((to_node["node_type"] === "metabolite")) {
                    if ((! _pj.in_es6(to_node["bigg_id"], met_id_to_uid))) {
                        met_id_to_uid[to_node["bigg_id"]] = to_node_id;
                    } else {
                        console.log("!!!", to_node["bigg_id"]);
                    }
                }
            }
            for (var m, _pj_f = 0, _pj_d = rnode["metabolites"], _pj_e = _pj_d.length; (_pj_f < _pj_e); _pj_f += 1) {
                m = _pj_d[_pj_f];
                if (_pj.in_es6(m["bigg_id"], met_id_to_uid)) {
                    m["node_uid"] = met_id_to_uid[m["bigg_id"]];
                }
            }
        }
        return node_uid_map;
    }
    delete_metabolites(cpd_ids) {
        var delete_uids, node, node_id;
        delete_uids = set();
        for (var map_uid, _pj_c = 0, _pj_a = this.escher_graph["nodes"], _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            map_uid = _pj_a[_pj_c];
            node = this.escher_graph["nodes"][map_uid];
            if ((node["node_type"] === "metabolite")) {
                node_id = node["bigg_id"];
                if (_pj.in_es6(node_id, cpd_ids)) {
                    delete_uids.add(map_uid);
                }
            }
        }
        for (var map_uid, _pj_c = 0, _pj_a = delete_uids, _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            map_uid = _pj_a[_pj_c];
            delete this.escher_graph["nodes"][map_uid];
        }
    }
    delete_reactions(rxn_ids, remove_compounds = false) {
        var delete_compounds, delete_markers, from_node_id, n_type, rnode, s, tagged_compounds, to_node_id, updated;
        updated = {};
        delete_markers = set();
        delete_compounds = set();
        tagged_compounds = set();
        for (var map_uid, _pj_c = 0, _pj_a = this.escher_graph["reactions"], _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            map_uid = _pj_a[_pj_c];
            rnode = this.escher_graph["reactions"][map_uid];
            if ((! _pj.in_es6(rnode["bigg_id"], rxn_ids))) {
                updated[map_uid] = rnode;
            } else {
                for (var s_uid, _pj_f = 0, _pj_d = rnode["segments"], _pj_e = _pj_d.length; (_pj_f < _pj_e); _pj_f += 1) {
                    s_uid = _pj_d[_pj_f];
                    s = rnode["segments"][s_uid];
                    from_node_id = s["from_node_id"];
                    to_node_id = s["to_node_id"];
                    n_type = this.escher_graph["nodes"][from_node_id]["node_type"];
                    if ((n_type === "metabolite")) {
                        delete_compounds.add(from_node_id);
                    } else {
                        delete_markers.add(from_node_id);
                    }
                    n_type = this.escher_graph["nodes"][to_node_id]["node_type"];
                    if ((n_type === "metabolite")) {
                        delete_compounds.add(to_node_id);
                    } else {
                        delete_markers.add(to_node_id);
                    }
                }
            }
        }
        for (var map_uid, _pj_c = 0, _pj_a = delete_markers, _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            map_uid = _pj_a[_pj_c];
            delete this.escher_graph["nodes"][map_uid];
        }
        if (remove_compounds) {
        }
        this.escher_graph["reactions"] = updated;
    }
    get nodes() {
        return this.escher_graph["nodes"];
    }
    get reactions() {
        var reactions;
        reactions = list(this.escher_graph["reactions"].values());
        return reactions;
    }
    get metabolites() {
        var metabolites;
        metabolites = list(filter((o) => {
    return (o["node_type"] === "metabolite");
}, this.escher_graph["nodes"].values()));
        return metabolites;
    }
    generate_coords(func, n, x1, x2, x, y, orient, prod) {
        var a, coords;
        a = x;
        coords = [];
        for (var pos_x = x1, _pj_a = x2; (pos_x < _pj_a); pos_x += Number.parseInt(((x2 - x1) / n))) {
            console.log((pos_x + x), (func(pos_x) + y));
            if (prod) {
                a -= 500;
            }
            coords.append([rotate(a, y, (pos_x + x), (func(pos_x) + y), orient)[0], rotate(a, y, (pos_x + x), (func(pos_x) + y), orient)[1]]);
            if (prod) {
                a += 500;
            }
        }
        return coords;
    }
    get_nodes(stoich, rxn_numb) {
        var node_ids2, prim_node_ids, second_node_ids;
        prim_node_ids = list();
        second_node_ids = list();
        node_ids2 = list();
        for (var k, _pj_c = 0, _pj_a = stoich[rxn_numb.toString()], _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            k = _pj_a[_pj_c];
            node_ids2.append(k);
        }
        for (var k = 0, _pj_a = node_ids2.length; (k < _pj_a); k += 1) {
            if ((stoich[rxn_numb.toString()][node_ids2[k]] < 0)) {
                prim_node_ids.append(node_ids2.pop(k));
                break;
            }
        }
        for (var k = 0, _pj_a = node_ids2.length; (k < _pj_a); k += 1) {
            if ((stoich[rxn_numb.toString()][node_ids2[k]] > 0)) {
                prim_node_ids.append(node_ids2.pop(k));
                break;
            }
        }
        for (var k, _pj_c = 0, _pj_a = node_ids2, _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            k = _pj_a[_pj_c];
            second_node_ids.append(k);
        }
        return [prim_node_ids, second_node_ids];
    }
    add_reaction(stoich, x_coord, y_coord, orient, reaction_length, prim_react, prim_prod, layout, rxn_numb, cc_coords, cc, prev_prod, prev_id) {
        var deg, k, max, maxR, maxS, midmark, midmark_bottom, midmark_bottom_id, midmark_id, midmark_top, midmark_top_id, mod, ops, p_to_s, prim_nodes, prim_prod_id, prim_react_id, second_nodes, top;
        if ((rxn_numb >= stoich.length)) {
            return;
        }
        midmark = {"y": 0, "x": 0, "node_type": "midmarker"};
        midmark_top = copy.deepcopy(midmark);
        midmark_bottom = copy.deepcopy(midmark);
        prim_react_id = 0;
        prim_prod_id = 0;
        midmark_id = 0;
        midmark_top_id = 0;
        midmark_bottom_id = 0;
        prim_nodes = this.get_nodes(stoich, rxn_numb)[0];
        second_nodes = this.get_nodes(stoich, rxn_numb)[1];
        console.log(prim_nodes);
        max = 0;
        for (var k, _pj_c = 0, _pj_a = layout["nodes"].keys(), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            k = _pj_a[_pj_c];
            k = Number.parseInt(k);
            if ((k > max)) {
                max = k;
            }
        }
        prim_react = {"node_is_primary": true, "name": "compound1", "label_x": 0, "node_type": "metabolite", "y": 0, "x": 0, "label_y": 0};
        prim_prod = {"node_is_primary": true, "name": "compound1", "label_x": 0, "node_type": "metabolite", "y": 0, "x": 0, "label_y": 0};
        prim_react["bigg_id"] = prim_nodes[0];
        prim_prod["bigg_id"] = prim_nodes[1];
        if (((! _pj.in_es6(prim_react["bigg_id"], cc)) || ((prev_prod === prim_react["bigg_id"]) || (prev_prod === null)))) {
            if ((_pj.in_es6(prim_prod["bigg_id"], cc) && ((prev_prod !== null) && (prev_prod !== prim_react["bigg_id"])))) {
                orient += (math.pi / 2);
                orient = add_prim_nodes(prim_react, prim_prod, orient, cc_coords, reaction_length, midmark, layout);
                orient += math.pi;
                layout["nodes"][(max + 1).toString()] = prim_react;
                layout["nodes"][(max + 2).toString()] = midmark;
                layout["nodes"][(max + 3).toString()] = midmark_top;
                layout["nodes"][(max + 4).toString()] = midmark_bottom;
                prim_prod_id = cc_coords[prim_prod["bigg_id"]]["node_id"];
                prim_react_id = (max + 1).toString();
                midmark_id = (max + 2).toString();
                midmark_top_id = (max + 3).toString();
                midmark_bottom_id = (max + 4).toString();
                max += 4;
            } else {
                prim_react["x"] = x_coord;
                prim_react["y"] = y_coord;
                prim_react["label_x"] = (x_coord - 30);
                prim_react["label_y"] = (y_coord - 30);
                for (var n, _pj_c = 0, _pj_a = layout["nodes"], _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
                    n = _pj_a[_pj_c];
                    if ((layout["nodes"][n]["node_type"] === "metabolite")) {
                        while (((((math.cos(orient) * reaction_length) + prim_react["x"]) === layout["nodes"][n]["x"]) && (((- (math.sin(orient) * reaction_length)) + prim_react["y"]) === layout["nodes"][n]["y"]))) {
                            orient += (math.pi / 2);
                        }
                    }
                }
                prim_prod["x"] = ((math.cos(orient) * reaction_length) + prim_react["x"]);
                prim_prod["y"] = ((- (math.sin(orient) * reaction_length)) + prim_react["y"]);
                prim_prod["label_x"] = ((math.cos(orient) * reaction_length) + prim_react["label_x"]);
                prim_prod["label_y"] = ((- (math.sin(orient) * reaction_length)) + prim_react["label_y"]);
                midmark["x"] = ((math.cos(orient) * (reaction_length / 2)) + prim_react["x"]);
                midmark["y"] = ((- (math.sin(orient) * (reaction_length / 2))) + prim_react["y"]);
                layout["nodes"][(max + 1).toString()] = midmark;
                layout["nodes"][(max + 2).toString()] = prim_prod;
                layout["nodes"][(max + 3).toString()] = midmark_top;
                layout["nodes"][(max + 4).toString()] = midmark_bottom;
                prim_prod_id = (max + 2).toString();
                prim_react_id = prev_id;
                midmark_top_id = (max + 3).toString();
                midmark_bottom_id = (max + 4).toString();
                midmark_id = (max + 1).toString();
                max += 4;
                if ((rxn_numb === 0)) {
                    max -= 4;
                    layout["nodes"][(max + 1).toString()] = prim_react;
                    layout["nodes"][(max + 2).toString()] = prim_prod;
                    layout["nodes"][(max + 3).toString()] = midmark;
                    layout["nodes"][(max + 4).toString()] = midmark_top;
                    layout["nodes"][(max + 5).toString()] = midmark_bottom;
                    prim_react_id = (max + 1).toString();
                    midmark_id = (max + 3).toString();
                    midmark_top_id = (max + 4).toString();
                    midmark_bottom_id = (max + 5).toString();
                    max += 5;
                }
            }
        } else {
            if (_pj.in_es6(prim_prod["bigg_id"], cc_coords.keys())) {
                orient += (math.pi / 2);
                add_prim_nodes(prim_react, prim_prod, orient, cc_coords, reaction_length, midmark, layout);
                orient += math.pi;
                layout["nodes"][(max + 1).toString()] = prim_react;
                layout["nodes"][(max + 2).toString()] = midmark;
                layout["nodes"][(max + 3).toString()] = midmark_top;
                layout["nodes"][(max + 4).toString()] = midmark_bottom;
                prim_prod_id = cc_coords[prim_prod["bigg_id"]]["node_id"];
                prim_react_id = (max + 1).toString();
                midmark_id = (max + 2).toString();
                midmark_top_id = (max + 3).toString();
                midmark_bottom_id = (max + 4).toString();
                max += 4;
            } else {
                orient += ((3 * math.pi) / 2);
                add_prim_nodes(prim_prod, prim_react, orient, cc_coords, reaction_length, midmark, layout);
                layout["nodes"][(max + 2).toString()] = prim_prod;
                layout["nodes"][(max + 3).toString()] = midmark;
                layout["nodes"][(max + 4).toString()] = midmark_top;
                layout["nodes"][(max + 5).toString()] = midmark_bottom;
                prim_react_id = cc_coords[prim_react["bigg_id"]]["node_id"];
                prim_prod_id = (max + 2).toString();
                midmark_id = (max + 3).toString();
                midmark_top_id = (max + 4).toString();
                midmark_bottom_id = (max + 5).toString();
                max += 5;
            }
        }
        if (_pj.in_es6(prim_prod["bigg_id"], cc)) {
            cc_coords[prim_prod["bigg_id"]]["x"] = prim_prod["x"];
            cc_coords[prim_prod["bigg_id"]]["y"] = prim_prod["y"];
            cc_coords[prim_prod["bigg_id"]]["node_id"] = prim_prod_id;
        }
        if (_pj.in_es6(prim_react["bigg_id"], cc)) {
            cc_coords[prim_react["bigg_id"]]["x"] = prim_react["x"];
            cc_coords[prim_react["bigg_id"]]["y"] = prim_react["y"];
            cc_coords[prim_react["bigg_id"]]["node_id"] = prim_react_id;
        }
        if (((rxn_numb === 0) && _pj.in_es6(prim_react["bigg_id"], cc))) {
            cc_coords[prim_react["bigg_id"]]["x"] = prim_react["x"];
            cc_coords[prim_react["bigg_id"]]["y"] = prim_react["y"];
            cc_coords[prim_react["bigg_id"]]["node_id"] = prim_react_id;
        }
        maxR = 0;
        for (var k, _pj_c = 0, _pj_a = layout["reactions"].keys(), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            k = _pj_a[_pj_c];
            k = Number.parseInt(k);
            if ((k > maxR)) {
                maxR = k;
            }
        }
        maxS = 0;
        for (var k, _pj_c = 0, _pj_a = layout["reactions"].keys(), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            k = _pj_a[_pj_c];
            for (var j, _pj_f = 0, _pj_d = layout["reactions"][k]["segments"].keys(), _pj_e = _pj_d.length; (_pj_f < _pj_e); _pj_f += 1) {
                j = _pj_d[_pj_f];
                if ((Number.parseInt(j) > maxS)) {
                    maxS = Number.parseInt(j);
                }
            }
        }
        layout["reactions"][(maxR + 1).toString()] = {"name": rxn_numb.toString(), "bigg_id": rxn_numb.toString(), "segments": {}, "genes": [], "reversibility": false, "metabolites": [], "label_x": (midmark["x"] + (50 * math.sin(orient))), "label_y": (midmark["y"] + (50 * math.cos(orient))), "gene_reaction_rule": ""};
        midmark_top["x"] = (midmark["x"] - (25 * math.cos(orient)));
        midmark_bottom["x"] = (midmark["x"] + (25 * math.cos(orient)));
        midmark_top["y"] = (midmark["y"] + (25 * math.sin(orient)));
        midmark_bottom["y"] = (midmark["y"] - (25 * math.sin(orient)));
        ops = [operator.add, operator.sub];
        top = false;
        p_to_s = 100;
        mod = 0;
        deg = 0;
        if ((second_nodes.length > 0)) {
            maxS = add_secondary_nodes(second_nodes, orient, prim_react["x"], prim_react["y"], layout, stoich[rxn_numb.toString()], midmark_top_id, midmark_bottom_id, midmark_id, midmark_top, midmark_bottom, midmark, maxR);
        }
        maxS += 1;
        add_segment(layout, midmark_top_id, prim_react_id, maxR, maxS, midmark, midmark_top, prim_react, 1, orient, 0);
        layout["reactions"][(maxR + 1).toString()]["metabolites"].append({"coefficient": stoich[rxn_numb.toString()][prim_react["bigg_id"]], "bigg_id": prim_react["bigg_id"]});
        add_segment(layout, prim_prod_id, midmark_bottom_id, maxR, (maxS + 1), midmark, prim_prod, midmark_bottom, 0, orient, 0);
        layout["reactions"][(maxR + 1).toString()]["metabolites"].append({"coefficient": stoich[rxn_numb.toString()][prim_prod["bigg_id"]], "bigg_id": prim_prod["bigg_id"]});
        add_segment(layout, midmark_id, midmark_top_id, maxR, (maxS + 2), midmark, midmark, midmark_top, null, orient, 0);
        add_segment(layout, midmark_bottom_id, midmark_id, maxR, (maxS + 3), midmark, midmark_bottom, midmark, null, orient, 0);
        add_reaction(stoich, prim_prod["x"], prim_prod["y"], ((3 * math.pi) / 2), 500, "t1", "t2", layout, (rxn_numb + 1), cc_coords, cc, prim_prod["bigg_id"], prim_prod_id);
    }
    rotate(x, y, x1, y1, orient) {
        var qx, qy;
        qx = ((x + (math.cos(orient) * (x1 - x))) - (math.sin(orient) * (y1 - y)));
        qy = (y - ((math.sin(orient) * (x1 - x)) + (math.cos(orient) * (y1 - y))));
        return [qx, qy];
    }
    add_prim_nodes(prim_react, prim_prod, orient, cc_coords, reaction_length, midmark, layout) {
        prim_prod["x"] = cc_coords[prim_prod["bigg_id"]]["x"];
        prim_prod["y"] = cc_coords[prim_prod["bigg_id"]]["y"];
        prim_prod["label_x"] = (prim_prod["x"] - 30);
        prim_prod["label_y"] = (prim_prod["y"] - 30);
        for (var n, _pj_c = 0, _pj_a = layout["nodes"], _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            n = _pj_a[_pj_c];
            if ((layout["nodes"][n]["node_type"] === "metabolite")) {
                while (((((math.cos(orient) * reaction_length) + prim_prod["x"]) === layout["nodes"][n]["x"]) && (((- (math.sin(orient) * reaction_length)) + prim_prod["y"]) === layout["nodes"][n]["y"]))) {
                    orient += (math.pi / 2);
                }
            }
        }
        prim_react["x"] = ((math.cos(orient) * reaction_length) + prim_prod["x"]);
        prim_react["y"] = ((- (math.sin(orient) * reaction_length)) + prim_prod["y"]);
        prim_react["label_x"] = ((math.cos(orient) * reaction_length) + prim_prod["label_x"]);
        prim_react["label_y"] = ((- (math.sin(orient) * reaction_length)) + prim_prod["label_y"]);
        midmark["x"] = (prim_react["x"] - (math.cos(orient) * (reaction_length / 2)));
        midmark["y"] = (prim_react["y"] + (math.sin(orient) * (reaction_length / 2)));
        return orient;
    }
    add_segment(layout, to_node_id, from_node_id, maxR, maxS, midmark, to_node, from_node, top, orient, n) {
        var dist1, dist2;
        dist1 = 50;
        dist2 = 150;
        if ((to_node["node_type"] === "metabolite")) {
            if ((! to_node["node_is_primary"])) {
                dist1 = (50 - (2 * n));
                dist2 = (150 - (2 * n));
            }
        }
        if ((from_node["node_type"] === "metabolite")) {
            if ((! from_node["node_is_primary"])) {
                dist1 = (50 - (2 * n));
                dist2 = (150 - (2 * n));
            }
        }
        layout["reactions"][(maxR + 1).toString()]["segments"][(maxS + 1).toString()] = {};
        layout["reactions"][(maxR + 1).toString()]["segments"][(maxS + 1).toString()]["to_node_id"] = to_node_id;
        layout["reactions"][(maxR + 1).toString()]["segments"][(maxS + 1).toString()]["from_node_id"] = from_node_id;
        layout["reactions"][(maxR + 1).toString()]["segments"][(maxS + 1).toString()]["b2"] = {};
        layout["reactions"][(maxR + 1).toString()]["segments"][(maxS + 1).toString()]["b1"] = {};
        if (((to_node["node_type"] === "midmarker") && (from_node["node_type"] === "midmarker"))) {
            layout["reactions"][(maxR + 1).toString()]["segments"][(maxS + 1).toString()]["b2"] = null;
            layout["reactions"][(maxR + 1).toString()]["segments"][(maxS + 1).toString()]["b1"] = null;
        } else {
            layout["reactions"][(maxR + 1).toString()]["segments"][(maxS + 1).toString()]["b2"]["x"] = midmark["x"];
            layout["reactions"][(maxR + 1).toString()]["segments"][(maxS + 1).toString()]["b2"]["y"] = midmark["y"];
            layout["reactions"][(maxR + 1).toString()]["segments"][(maxS + 1).toString()]["b1"]["y"] = midmark["y"];
            layout["reactions"][(maxR + 1).toString()]["segments"][(maxS + 1).toString()]["b1"]["x"] = midmark["x"];
            layout["reactions"][(maxR + 1).toString()]["segments"][(maxS + 1).toString()]["b2"]["y"] = ops[(! top)](midmark["y"], (dist1 * math.sin(orient)));
            layout["reactions"][(maxR + 1).toString()]["segments"][(maxS + 1).toString()]["b1"]["y"] = ops[(! top)](midmark["y"], (dist2 * math.sin(orient)));
            layout["reactions"][(maxR + 1).toString()]["segments"][(maxS + 1).toString()]["b2"]["x"] = ops[top](midmark["x"], (dist1 * math.cos(orient)));
            layout["reactions"][(maxR + 1).toString()]["segments"][(maxS + 1).toString()]["b1"]["x"] = ops[top](midmark["x"], (dist2 * math.cos(orient)));
        }
    }
    add_secondary_nodes(second_nodes, orient, x_coord, y_coord, layout, stoich, midmark_top_id, midmark_bottom_id, midmark_id, midmark_top, midmark_bottom, midmark, maxR) {
        var max, maxS, prod_coords, prod_nodes, react_coords, react_nodes, secondary;
        react_coords = [];
        react_nodes = [];
        prod_coords = [];
        for (var n = 0, _pj_a = (second_nodes.length - 1); (n < _pj_a); n += 1) {
            if ((stoich[second_nodes[n]] < 0)) {
                react_nodes.append(second_nodes.pop(n));
            }
        }
        prod_nodes = second_nodes;
        max = 0;
        for (var n, _pj_c = 0, _pj_a = layout["nodes"], _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            n = _pj_a[_pj_c];
            if ((Number.parseInt(n) > max)) {
                max = Number.parseInt(n);
            }
        }
        maxS = 0;
        for (var k, _pj_c = 0, _pj_a = layout["reactions"], _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            k = _pj_a[_pj_c];
            for (var j, _pj_f = 0, _pj_d = layout["reactions"][k]["segments"], _pj_e = _pj_d.length; (_pj_f < _pj_e); _pj_f += 1) {
                j = _pj_d[_pj_f];
                if ((Number.parseInt(j) > maxS)) {
                    maxS = Number.parseInt(j);
                }
            }
        }
        if ((react_nodes.length > 0)) {
            react_coords = generate_coords((x) => {
    return (pow(x, 2) / 30);
}, react_nodes.length, 60, 160, x_coord, y_coord, orient, false);
        }
        for (var c = 0, _pj_a = react_coords.length; (c < _pj_a); c += 1) {
            secondary = {"node_is_primary": false, "name": "compound1", "label_x": 0, "node_type": "metabolite", "y": 0, "x": 0, "bigg_id": "", "label_y": 0};
            secondary["x"] = react_coords[c][0];
            secondary["label_x"] = react_coords[c][0];
            secondary["y"] = react_coords[c][1];
            secondary["label_y"] = (react_coords[c][1] + 30);
            secondary["bigg_id"] = react_nodes[c];
            layout["nodes"][(max + 1).toString()] = secondary;
            add_segment(layout, (max + 1).toString(), midmark_top_id, maxR, maxS, midmark, secondary, midmark_top, true, orient, c);
            layout["reactions"][(maxR + 1).toString()]["metabolites"].append({"coefficient": (- 1), "bigg_id": react_nodes[c]});
            max += 1;
            maxS += 1;
        }
        if ((react_nodes.length > 0)) {
            prod_coords = generate_coords((x) => {
    return (pow(x, 2) / 30);
}, prod_nodes.length, (- 60), (- 160), (x_coord + 500), y_coord, orient, true);
        }
        for (var c = 0, _pj_a = (prod_coords.length - 1); (c < _pj_a); c += 1) {
            secondary = {"node_is_primary": false, "name": "compound1", "label_x": 0, "node_type": "metabolite", "y": 0, "x": 0, "bigg_id": "", "label_y": 0};
            secondary["x"] = prod_coords[c][0];
            secondary["label_x"] = prod_coords[c][0];
            secondary["y"] = prod_coords[c][1];
            secondary["label_y"] = (prod_coords[c][1] + 30);
            secondary["bigg_id"] = prod_nodes[c];
            layout["nodes"][(max + 1).toString()] = secondary;
            add_segment(layout, (max + 1).toString(), midmark_bottom_id, maxR, maxS, midmark, secondary, midmark_bottom, false, orient, c);
            layout["reactions"][(maxR + 1).toString()]["metabolites"].append({"coefficient": (- 1), "bigg_id": prod_nodes[c]});
            max += 1;
            maxS += 1;
        }
        return maxS;
    }
    add_curved_segment(layout, to_node_id, from_node_id, x, y) {
        var k, maxR, maxS;
        maxS = 0;
        for (var k, _pj_c = 0, _pj_a = layout["reactions"], _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            k = _pj_a[_pj_c];
            for (var j, _pj_f = 0, _pj_d = layout["reactions"][k]["segments"], _pj_e = _pj_d.length; (_pj_f < _pj_e); _pj_f += 1) {
                j = _pj_d[_pj_f];
                if ((Number.parseInt(j) > maxS)) {
                    maxS = Number.parseInt(j);
                }
            }
        }
        maxR = 0;
        for (var k, _pj_c = 0, _pj_a = layout["reactions"].keys(), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            k = _pj_a[_pj_c];
            k = Number.parseInt(k);
            if ((k > maxR)) {
                maxR = k;
            }
        }
        layout["reactions"][(maxR + 1).toString()] = {"name": 1, "bigg_id": 1, "segments": {}, "genes": [], "reversibility": false, "metabolites": [], "label_x": 0, "label_y": 0, "gene_reaction_rule": ""};
        layout["reactions"][(maxR + 1).toString()]["segments"][(maxS + 1).toString()] = {};
        layout["reactions"][(maxR + 1).toString()]["segments"][(maxS + 1).toString()]["to_node_id"] = to_node_id;
        layout["reactions"][(maxR + 1).toString()]["segments"][(maxS + 1).toString()]["from_node_id"] = from_node_id;
        layout["reactions"][(maxR + 1).toString()]["segments"][(maxS + 1).toString()]["b2"] = {};
        layout["reactions"][(maxR + 1).toString()]["segments"][(maxS + 1).toString()]["b1"] = {};
        layout["reactions"][(maxR + 1).toString()]["segments"][(maxS + 1).toString()]["b2"]["x"] = (x - 30);
        layout["reactions"][(maxR + 1).toString()]["segments"][(maxS + 1).toString()]["b2"]["y"] = (y - 30);
        layout["reactions"][(maxR + 1).toString()]["segments"][(maxS + 1).toString()]["b1"]["y"] = (y - 30);
        layout["reactions"][(maxR + 1).toString()]["segments"][(maxS + 1).toString()]["b1"]["x"] = (x - 30);
    }
    add_branches(layout, prim_react, prim_react_id, prim_nodes, numb, nodes_in_layout, reaction_length, max) {
        var k, maxR, maxS, midmark, midmark_bottom, midmark_top, orient, prim_prod, x;
        maxS = 0;
        for (var k, _pj_c = 0, _pj_a = layout["reactions"], _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            k = _pj_a[_pj_c];
            for (var j, _pj_f = 0, _pj_d = layout["reactions"][k]["segments"], _pj_e = _pj_d.length; (_pj_f < _pj_e); _pj_f += 1) {
                j = _pj_d[_pj_f];
                if ((Number.parseInt(j) > maxS)) {
                    maxS = Number.parseInt(j);
                }
            }
        }
        maxR = 0;
        for (var k, _pj_c = 0, _pj_a = layout["reactions"].keys(), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            k = _pj_a[_pj_c];
            k = Number.parseInt(k);
            if ((k > maxR)) {
                maxR = k;
            }
        }
        x = 0;
        midmark = {"y": prim_react["y"], "x": (prim_react["x"] + (reaction_length / 2)), "node_type": "midmarker"};
        midmark_top = copy.deepcopy(midmark);
        midmark_bottom = copy.deepcopy(midmark);
        for (var n, _pj_c = 0, _pj_a = prim_nodes.values(), _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            n = _pj_a[_pj_c];
            if (((n[0][0] === prim_react["bigg_id"]) && (! _pj.in_es6(n[1][0], nodes_in_layout)))) {
                prim_prod = {"node_is_primary": true, "name": "compound1", "label_x": (prim_react["x"] + reaction_length), "node_type": "metabolite", "y": (prim_react["y"] - (x * reaction_length)), "x": (prim_react["x"] + reaction_length), "label_y": (prim_react["y"] - (x * reaction_length)), "bigg_id": n[1][0]};
                orient = math.atan(((x * reaction_length) / reaction_length));
                midmark = {"y": (prim_prod["y"] + (reaction_length / 2)), "x": ((prim_prod["x"] - (reaction_length / 2)) - 100), "node_type": "midmarker"};
                midmark_top = {"y": ((prim_prod["y"] + (reaction_length / 2)) - (30 * math.sin(orient))), "x": (((prim_prod["x"] - (reaction_length / 2)) + (30 * math.cos(orient))) - 100), "node_type": "midmarker"};
                midmark_bottom = {"y": ((prim_prod["y"] + (reaction_length / 2)) + (30 * math.sin(orient))), "x": (((prim_prod["x"] - (reaction_length / 2)) - (30 * math.cos(orient))) - 100), "node_type": "midmarker"};
                layout["nodes"][(max + 1).toString()] = prim_prod;
                layout["nodes"][(max + 2).toString()] = midmark;
                layout["nodes"][(max + 3).toString()] = midmark_top;
                layout["nodes"][(max + 4).toString()] = midmark_bottom;
                add_curved_segment(layout, (max + 1), (max + 3), ((((prim_prod["x"] - (reaction_length / 2)) + 10) + (prim_react["x"] + reaction_length)) / 2), (((prim_react["y"] - (x * reaction_length)) + (prim_react["y"] - (x * reaction_length))) / 2));
                add_curved_segment(layout, (max + 4), prim_react_id, ((((prim_prod["x"] - (reaction_length / 2)) - 10) + prim_react["x"]) / 2), ((((prim_prod["y"] + (reaction_length / 2)) + 10) + prim_react["y"]) / 2));
                add_segment(layout, (max + 2), (max + 4), maxR, (maxS + 2), midmark, midmark, midmark_bottom, true, orient, 1);
                add_segment(layout, (max + 3), (max + 2), maxR, (maxS + 3), midmark, midmark_top, midmark, true, orient, 1);
                maxS += 3;
                max += 4;
                x += 1;
            }
            if (((n[1][0] === prim_react["bigg_id"]) && (! _pj.in_es6(n[0][0], nodes_in_layout)))) {
                prim_prod = {"node_is_primary": true, "name": "compound1", "label_x": (prim_react["x"] + reaction_length), "node_type": "metabolite", "y": (prim_react["y"] - (x * reaction_length)), "x": (prim_react["x"] + reaction_length), "label_y": (prim_react["y"] - (x * reaction_length)), "bigg_id": n[0][0]};
                orient = math.atan(((x * reaction_length) / reaction_length));
                midmark = {"y": (prim_prod["y"] + (reaction_length / 2)), "x": (prim_prod["x"] - (reaction_length / 2)), "node_type": "midmarker"};
                midmark_top = {"y": ((prim_prod["y"] + (reaction_length / 2)) - (30 * math.sin(orient))), "x": ((prim_prod["x"] - (reaction_length / 2)) + (30 * math.cos(orient))), "node_type": "midmarker"};
                midmark_bottom = {"y": ((prim_prod["y"] + (reaction_length / 2)) + (30 * math.sin(orient))), "x": ((prim_prod["x"] - (reaction_length / 2)) - (30 * math.cos(orient))), "node_type": "midmarker"};
                layout["nodes"][(max + 1).toString()] = prim_prod;
                layout["nodes"][(max + 2).toString()] = midmark;
                layout["nodes"][(max + 3).toString()] = midmark_top;
                layout["nodes"][(max + 4).toString()] = midmark_bottom;
                add_curved_segment(layout, (max + 1), (max + 3), ((((prim_prod["x"] - (reaction_length / 2)) + 10) + (prim_react["x"] + reaction_length)) / 2), (((prim_react["y"] - (x * reaction_length)) + (prim_react["y"] - (x * reaction_length))) / 2));
                add_curved_segment(layout, (max + 4), prim_react_id, ((((prim_prod["x"] - (reaction_length / 2)) - 10) + prim_react["x"]) / 2), ((((prim_prod["y"] + (reaction_length / 2)) + 10) + prim_react["y"]) / 2));
                add_segment(layout, (max + 2), (max + 4), maxR, (maxS + 2), midmark, midmark, midmark_bottom, true, orient, 1);
                add_segment(layout, (max + 3), (max + 2), maxR, (maxS + 3), midmark, midmark_top, midmark, true, orient, 1);
                maxS += 3;
                max += 4;
                x += 1;
            }
        }
        return max;
    }
    add_reactions(stoich, cc, x, y, layout) {
        var cc_coords;
        cc_coords = {};
        for (var c, _pj_c = 0, _pj_a = cc, _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            c = _pj_a[_pj_c];
            cc_coords[c] = {"x": 0, "y": 0};
        }
        this.add_reaction(stoich, x, y, ((3 * math.pi) / 2), 500, "t1", "t2", layout, 0, cc_coords, cc, null, null);
    }
    display_in_notebook(enable_editing = false) {
        var builder;
        builder = new escher.Builder({"map_json": json.dumps(this.escher_map)});
        return builder.display_in_notebook({"enable_editing": enable_editing});
    }
    set_to_origin() {
        var n, offset_x, offset_y, rnode, segment, tlabel;
        offset_x = this.escher_graph["canvas"]["x"];
        offset_y = this.escher_graph["canvas"]["y"];
        this.escher_graph["canvas"]["x"] = 0;
        this.escher_graph["canvas"]["y"] = 0;
        for (var uid, _pj_c = 0, _pj_a = this.nodes, _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            uid = _pj_a[_pj_c];
            n = this.nodes[uid];
            n["x"] -= offset_x;
            n["y"] -= offset_y;
            if (_pj.in_es6("label_x", n)) {
                n["label_x"] -= offset_x;
            }
            if (_pj.in_es6("label_y", n)) {
                n["label_y"] -= offset_y;
            }
        }
        for (var uid, _pj_c = 0, _pj_a = this.escher_graph["reactions"], _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            uid = _pj_a[_pj_c];
            rnode = this.escher_graph["reactions"][uid];
            rnode["label_x"] -= offset_x;
            rnode["label_y"] -= offset_y;
            for (var s_uid, _pj_f = 0, _pj_d = rnode["segments"], _pj_e = _pj_d.length; (_pj_f < _pj_e); _pj_f += 1) {
                s_uid = _pj_d[_pj_f];
                segment = rnode["segments"][s_uid];
                if ((_pj.in_es6("b1", segment) && segment["b1"])) {
                    segment["b1"]["x"] -= offset_x;
                    segment["b1"]["y"] -= offset_y;
                }
                if ((_pj.in_es6("b2", segment) && segment["b2"])) {
                    segment["b2"]["x"] -= offset_x;
                    segment["b2"]["y"] -= offset_y;
                }
            }
        }
        for (var uid, _pj_c = 0, _pj_a = this.escher_graph["text_labels"], _pj_b = _pj_a.length; (_pj_c < _pj_b); _pj_c += 1) {
            uid = _pj_a[_pj_c];
            tlabel = this.escher_graph["text_labels"][uid];
            tlabel["x"] -= offset_x;
            tlabel["y"] -= offset_y;
        }
    }
    clone() {
        let data = JSON.parse(JSON.stringify(this.escher_map));
        return new EscherMap(data);
    }
}

//# sourceMappingURL=escher_map.js.map
