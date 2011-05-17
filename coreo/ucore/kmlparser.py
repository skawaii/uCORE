from xml.dom import Node

class KmlParser:
    GEX_NAMESPACE_URI = 'http://www.google.com/kml/ext/2.2'

    KML_NAMESPACES = ['http://www.opengis.net/kml/2.2', 'http://earth.google.com/kml/2.1', 
                      'http://earth.google.com/kml/2.0', 'http://earth.google.com/kml/2.2']
    
    KML_CONTAINER_NAMES = ['Folder', 'Document']

    KML_OVERLAY_NAMES = ['PhotoOverlay', 'ScreenOverlay', 'GroundOverlay']
    
    KML_FEATURE_NAMES = ['NetworkLink', 'Placemark']
    KML_FEATURE_NAMES.extend(KML_CONTAINER_NAMES)
    KML_FEATURE_NAMES.extend(KML_OVERLAY_NAMES)
    
    KML_GEOMETRY_NAMES = ['Point', 'LineString', 'LinearRing', 'Polygon', 
                          'MultiGeometry', 'Model']
    
    KML_STYLESELECTOR_NAMES = ['Style', 'StyleMap']
    
    KML_TIMEPRIMITIVE_NAMES = ['TimeSpan', 'TimeStamp']
    
    KML_ABSTRACTVIEW_NAMES = ['Camera', 'LookAt']
    
    KML_COLORSTYLE_NAMES = ['LineStyle', 'PolyStyle', 'IconStyle', 
                            'LabelStyle']
    
    KML_SUBSTYLE_NAMES = ['BalloonStyle', 'ListStyle']
    KML_SUBSTYLE_NAMES.extend(KML_COLORSTYLE_NAMES)
    
    KML_OBJECT_NAMES = ['Link', 'Icon', 'Orientation', 'Location', 'Scale', 
                        'Region', 'Lod', 'LatLonBox', 'LatLonAltBox']
    KML_OBJECT_NAMES.extend(KML_FEATURE_NAMES)
    KML_OBJECT_NAMES.extend(KML_GEOMETRY_NAMES)
    KML_OBJECT_NAMES.extend(KML_STYLESELECTOR_NAMES)
    KML_OBJECT_NAMES.extend(KML_TIMEPRIMITIVE_NAMES)
    KML_OBJECT_NAMES.extend(KML_ABSTRACTVIEW_NAMES)
    KML_OBJECT_NAMES.extend(KML_SUBSTYLE_NAMES)
    
    def child_element(self, node, childName = None, childNS = None):
        for child in node.childNodes:
            if (child.nodeType == Node.ELEMENT_NODE
                and (childName == None or child.tagName in childName)
                and (childNS == None or child.namespaceURI in childNS)):
                return child
        return None
    
    def element_value(self, element):
        txt = ''
        for child in element.childNodes:
            if (child.nodeType == Node.TEXT_NODE
                or child.nodeType == Node.CDATA_SECTION_NODE):
                txt = txt + child.data
        return txt
    
    def child_element_value(self, parentElement, childName = None, childNS = None):
        child = self.child_element(parentElement, childName, childNS)
        if (child != None):
            return self.element_value(child)
        return None

    def link_to_dict(self, node, dict = {}):
        kmlNS = node.namespaceURI
        dict['href'] = self.child_element_value(node, 'href', kmlNS)
        dict['refreshMode'] = self.child_element_value(node, 'refreshMode', kmlNS)
        refreshInterval = self.child_element_value(node, 'refreshInterval', kmlNS)
        if (refreshInterval != None and len(refreshInterval) > 0):
            dict['refreshInterval'] = float(refreshInterval)
        dict['viewRefreshMode'] = self.child_element_value(node, 'viewRefreshMode', kmlNS)
        viewRefreshTime = self.child_element_value(node, 'viewRefreshTime', kmlNS)
        if (viewRefreshTime != None and len(viewRefreshTime) > 0):
            dict['viewRefreshTime'] = float(viewRefreshTime)
        viewBoundScale = self.child_element_value(node, 'viewBoundScale', kmlNS)
        if (viewBoundScale != None and len(viewBoundScale) > 0):
            dict['viewBoundScale'] = float(viewBoundScale)
        dict['viewFormat'] = self.child_element_value(node, 'viewFormat', kmlNS)
        dict['httpQuery'] = self.child_element_value(node, 'httpQuery', kmlNS)
        return dict
    
    def networklink_to_dict(self, node, dict = {}):
        kmlNS = node.namespaceURI
        dict['refreshVisibility'] = True if self.child_element_value(node, 'refreshVisibility', kmlNS) == '1' else False
        dict['flyToView'] = True if self.child_element_value(node, 'flyToView', kmlNS) == '1' else False
        link = self.child_element(node, 'Link', kmlNS)
        if (link != None):
            dict['link'] = self.kmlobject_to_dict(link, {})
        return dict
    
    def placemark_to_dict(self, node, dict = {}):
        geometry = self.find_geometry_child(node)
        if (geometry != None):
            dict['geometry'] = self.kmlobject_to_dict(geometry, {})
        return dict
    
    def overlay_to_dict(self, node, dict = {}):
        print '***** Not implemented: %s' % node.tagName
        return dict
    
    def schema_to_dict(self, node, dict = {}):
        print '***** Not implemented: %s' % node.tagName
        return dict

    def document_to_dict(self, node, dict = {}):
        kmlNS = node.namespaceURI
        dict['children'] = []
        for child in node.childNodes:
            if (self.is_feature_element(child)):
                childFeature = self.kmlobject_to_dict(child, {})
                dict['children'].append(childFeature)
            elif (child.nodeType == Node.ELEMENT_NODE
                  and child.namespaceURI == kmlNS
                  and child.tagName == 'Schema'):
                schema = self.schema_to_dict(child, {})
                dict['children'].append(schema)
        return dict
    
    def folder_to_dict(self, node, dict = {}):
        dict['children'] = []
        for child in node.childNodes:
            if (self.is_feature_element(child)):
                childFeature = self.kmlobject_to_dict(child, {})
                dict['children'].append(childFeature)
        return dict
        return dict
    
    def container_to_dict(self, node, dict = {}):
        if (node.tagName == 'Document'):
            dict = self.document_to_dict(node, dict)
        elif (node.tagName == 'Folder'):
            dict = self.folder_to_dict(node, dict)
        return dict
    
    def is_feature_element(self, node):
        return (node.nodeType == Node.ELEMENT_NODE
                and node.namespaceURI in self.KML_NAMESPACES 
                and node.tagName in self.KML_FEATURE_NAMES)
        
    def find_feature_child(self, parent):
        kmlNS = parent.namespaceURI
        return self.child_element(parent, self.KML_FEATURE_NAMES, kmlNS)
    
    def feature_to_dict(self, node, dict = {}):
        kmlNS = node.namespaceURI
        dict['name'] = self.child_element_value(node, 'name', kmlNS)
        dict['visibility'] = True if self.child_element_value(node, 'visibility', kmlNS) == '1' else False
        dict['open'] = True if self.child_element_value(node, 'open', kmlNS) == '1' else False
        # atom:author
        # atom:link
        dict['address'] = self.child_element_value(node, 'address', kmlNS)
        # xal:AddressDetails
        dict['phoneNumber'] = self.child_element_value(node, 'phoneNumber', kmlNS)
        dict['snippet'] = self.child_element_value(node, 'Snippet', kmlNS)
        dict['description'] = self.child_element_value(node, 'description', kmlNS)
        abstractView = self.find_abstractview_child(node)
        if (abstractView != None):
            dict['abstractView'] = self.kmlobject_to_dict(abstractView, {})
        timePrimitive = self.find_timeprimitive_child(node)
        if (timePrimitive != None):
            dict['timePrimitive'] = self.kmlobject_to_dict(timePrimitive, {})
        styleUrl = self.child_element(node, 'styleUrl', kmlNS)
        if (styleUrl != None):
            dict['styleUrl'] = self.element_value(styleUrl)
        styleselector = self.find_styleselector_child(node)
        if (styleselector != None):
            dict['styleselector'] = self.kmlobject_to_dict(styleselector, {})
        region = self.child_element(node, 'Region', kmlNS)
        if (region != None):
            dict['region'] = self.kmlobject_to_dict(region, {})
        extendedData = self.child_element(node, 'ExtendedData', kmlNS)
        if (extendedData != None):
            dict['extendedData'] = self.extendedData_to_dict(extendedData, {})
        if (node.tagName == 'NetworkLink'):
            dict = self.networklink_to_dict(node, dict)
        elif (node.tagName == 'Placemark'):
            dict = self.placemark_to_dict(node, dict)
        elif (node.tagName in self.KML_OVERLAY_NAMES):
            dict = self.overlay_to_dict(node, dict)
        elif (node.tagName in self.KML_CONTAINER_NAMES):
            dict = self.container_to_dict(node, dict)
        return dict
    
    def is_geometry_element(self, node):
        return (node.nodeType == Node.ELEMENT_NODE
                and node.namespaceURI in self.KML_NAMESPACES
                and node.tagName in self.KML_GEOMETRY_NAMES)
    
    def find_geometry_child(self, parent):
        kmlNS = parent.namespaceURI
        return self.child_element(parent, self.KML_GEOMETRY_NAMES, kmlNS)
    
    def point_to_dict(self, node, dict = {}):
        kmlNS = node.namespaceURI
        dict['extrude'] = True if self.child_element_value(node, 'extrude', kmlNS) == '1' else False
        dict['altitudeMode'] = self.child_element_value(node, 'altitudeMode', kmlNS)
        dict['coordinates'] = self.child_element_value(node, 'coordinates', kmlNS)
        return dict

    def linestring_to_dict(self, node, dict = {}):
        kmlNS = node.namespaceURI
        val = self.child_element_value(node, 'altitudeOffset', self.GEX_NAMESPACE_URI)
        if (val != None and len(val) > 0):
            dict['altitudeOffset'] = float(val)
        dict['extrude'] = True if self.child_element_value(node, 'extrude', kmlNS) == '1' else False
        dict['tessellate'] = True if self.child_element_value(node, 'tessellate', kmlNS) == '1' else False
        dict['altitudeMode'] = self.child_element_value(node, 'altitudeMode', kmlNS)
        val = self.child_element_value(node, 'drawOrder', self.GEX_NAMESPACE_URI)
        if (val != None and len(val) > 0):
            dict['drawOrder'] = int(val)
        dict['coordinates'] = self.child_element_value(node, 'coordinates', kmlNS)
        return dict
    
    def linearring_to_dict(self, node, dict = {}):
        kmlNS = node.namespaceURI
        val = self.child_element_value(node, 'altitudeOffset', self.GEX_NAMESPACE_URI)
        if (val != None and len(val) > 0):
            dict['altitudeOffset'] = float(val)
        dict['extrude'] = True if self.child_element_value(node, 'extrude', kmlNS) == '1' else False
        dict['tessellate'] = True if self.child_element_value(node, 'tessellate', kmlNS) == '1' else False
        dict['altitudeMode'] = self.child_element_value(node, 'altitudeMode', kmlNS)
        dict['coordinates'] = self.child_element_value(node, 'coordinates', kmlNS)
        return dict
    
    def polygon_to_dict(self, node, dict = {}):
        kmlNS = node.namespaceURI
        dict['extrude'] = True if self.child_element_value(node, 'extrude', kmlNS) == '1' else False
        dict['tessellate'] = True if self.child_element_value(node, 'tessellate', kmlNS) == '1' else False
        dict['altitudeMode'] = self.child_element_value(node, 'altitudeMode', kmlNS)
        el = self.child_element(node, 'outerBoundaryIs', kmlNS)
        if (el != None):
            dict['outerBoundaryIs'] = {}
            el = self.child_element(el, 'LinearRing', kmlNS)
            if (el != None):
                dict['outerBoundaryIs']['linearRing'] = self.kmlobject_to_dict(el, {})
        el = self.child_element(node, 'innerBoundaryIs', kmlNS)
        if (el != None):
            dict['innerBoundaryIs'] = {}
            el = self.child_element(el, 'LinearRing', kmlNS)
            if (el != None):
                dict['innerBoundaryIs']['linearRing'] = self.kmlobject_to_dict(el, {})
        return dict

    def multigeometry_to_dict(self, node, dict = {}):
        geometry = []
        for child in node.childNodes:
            if (self.is_geometry_element(child)):
                childGeometry = self.kmlobject_to_dict(child, {})
                geometry.append(childGeometry)
        dict['geometry'] = geometry
        return dict
    
    def model_to_dict(self, node, dict = {}):
        kmlNS = node.namespaceURI
        el = self.child_element(node, 'altitudeMode', kmlNS)
        if (el == None):
            el = self.child_element(node, 'altitudeMode', self.GEX_NAMESPACE_URI)
        dict['altitudeMode'] = self.element_value(el)
        el = self.child_element(node, 'Location', kmlNS)
        if (el != None):
            dict['location'] = self.kmlobject_to_dict(el, {})
        el = self.child_element(node, 'Orientation', kmlNS)
        if (el != None):
            dict['orientation'] = self.kmlobject_to_dict(el, {})
        el = self.child_element(node, 'Scale', kmlNS)
        if (el != None):
            dict['scale'] = self.kmlobject_to_dict(el, {})
        el = self.child_element(node, 'Link', kmlNS)
        if (el != None):
            dict['link'] = self.kmlobject_to_dict(el, {})
        el = self.child_element(node, 'ResourceMap', kmlNS)
        if (el != None):
            resourceMap = []
            for child in el.childNodes:
                if (child.nodeType == Node.ELEMENT_NODE
                    and child.namespaceURI == kmlNS
                    and child.tagName == 'Alias'):
                    alias = {}
                    alias['targetHref'] = self.child_element_value(child, 'targetHref', kmlNS)
                    alias['sourceHref'] = self.child_element_value(child, 'sourceHref', kmlNS)
                    resourceMap.append(alias)
            dict['resourceMap'] = resourceMap
        return dict

    def geometry_to_dict(self, node, dict = {}):
        if (node.tagName == 'Point'):
            dict = self.point_to_dict(node, dict)
        elif (node.tagName == 'LineString'):
            dict = self.linestring_to_dict(node, dict)
        elif (node.tagName == 'LinearRing'):
            dict = self.linearring_to_dict(node, dict)
        elif (node.tagName == 'Polygon'):
            dict = self.polygon_to_dict(node, dict)
        elif (node.tagName == 'MultiGeometry'):
            dict = self.multigeometry_to_dict(node, dict)
        elif (node.tagName == 'Model'):
            dict = self.model_to_dict(node, dict)
        return dict
    
    def find_styleselector_child(self, parent):
        kmlNS = parent.namespaceURI
        return self.child_element(parent, self.KML_STYLESELECTOR_NAMES, kmlNS)
    
    def balloonstyle_to_dict(self, node, dict = {}):
        print '***** Not implemented: %s' % node.tagName
        return dict
    
    def itemicon_to_dict(self, node, dict = {}):
        kmlNS = node.namespaceURI
        dict['state'] = self.child_element_value(node, 'state', kmlNS)
        dict['href'] = self.child_element_value(node, 'href', kmlNS)
        return dict;
    
    def liststyle_to_dict(self, node, dict = {}):
        kmlNS = node.namespaceURI
        dict['listItemType'] = self.child_element_value(node, 'listItemType', kmlNS)
        dict['bgColor'] = self.child_element_value(node, 'bgColor', kmlNS)
        dict['itemIcons'] = []
        for child in node.childNodes:
            if (child.nodeType == Node.ELEMENT_NODE
                and child.namespaceURI == kmlNS
                and child.tagName == 'ItemIcon'):
                dict['itemIcons'].append(self.itemicon_to_dict(child, {}))
        return dict
    
    def iconstyle_to_dict(self, node, dict = {}):
        return dict;
    
    def labelstyle_to_dict(self, node, dict = {}):
        return dict;
    
    def linestyle_to_dict(self, node, dict = {}):
        kmlNS = node.namespaceURI
        dict['width'] = self.child_element_value(node, 'width', kmlNS)
        return dict;
    
    def polystyle_to_dict(self, node, dict = {}):
        return dict;
    
    def colorstyle_to_dict(self, node, dict = {}):
        kmlNS = node.namespaceURI
        dict['color'] = self.child_element_value(node, 'color', kmlNS)
        dict['colorMode'] = self.child_element_value(node, 'colorMode', kmlNS)
        if (node.tagName == 'IconStyle'):
            self.iconstyle_to_dict(node, dict);
        if (node.tagName == 'LabelStyle'):
            self.labelstyle_to_dict(node, dict)
        if (node.tagName == 'LineStyle'):
            self.linestyle_to_dict(node, dict);
        if (node.tagName == 'PolyStyle'):
            self.polystyle_to_dict(node, dict);
        return dict
    
    def substyle_to_dict(self, node, dict = {}):
        if (node.tagName == 'BalloonStyle'):
            dict = self.balloonstyle_to_dict(node, dict)
        elif (node.tagName == 'ListStyle'):
            dict = self.liststyle_to_dict(node, dict)
        elif (node.tagName in self.KML_COLORSTYLE_NAMES):
            dict = self.colorstyle_to_dict(node, dict)
        return dict
    
    def style_to_dict(self, node, dict = {}):
        kmlNS = node.namespaceURI
        for child in node.childNodes:
            if (child.nodeType == Node.ELEMENT_NODE
                and child.namespaceURI == kmlNS
                and child.tagName in self.KML_SUBSTYLE_NAMES):
                dict[child.tagName] = self.kmlobject_to_dict(child, {})
        return dict
    
    def stylemap_to_dict(self, node, dict = {}):
        print '***** Not implemented: %s' % node.tagName
        return dict
    
    def styleselector_to_dict(self, node, dict = {}):
        if (node.tagName == 'Style'):
            dict = self.style_to_dict(node, dict)
        elif (node.tagName == 'StyleMap'):
            dict = self.stylemap_to_dict(node, dict)
        return dict
    
    def find_timeprimitive_child(self, parent):
        kmlNS = parent.namespaceURI
        return self.child_element(parent, self.KML_TIMEPRIMITIVE_NAMES, kmlNS)
    
    def timespan_to_dict(self, node, dict = {}):
        kmlNS = node.namespaceURI
        el = self.child_element(node, 'begin', kmlNS)
        if (el != None):
            dict['begin'] = self.element_value(el)
        el = self.child_element(node, 'end', kmlNS)
        if (el != None):
            dict['end'] = self.element_value(el)
        return dict

    def timestamp_to_dict(self, node, dict = {}):
        kmlNS = node.namespaceURI
        el = self.child_element(node, 'when', kmlNS)
        if (el != None):
            dict['when'] = self.element_value(el)
        return dict
    
    def timeprimitive_to_dict(self, node, dict = {}):
        if (node.tagName == 'TimeSpan'):
            dict = self.timespan_to_dict(node, dict)
        elif (node.tagName == 'TimeStamp'):
            dict = self.timestamp_to_dict(node, dict)
        return dict
    
    def find_abstractview_child(self, parent):
        kmlNS = parent.namespaceURI
        return self.child_element(parent, self.KML_ABSTRACTVIEW_NAMES, kmlNS)

    def camera_to_dict(self, node, dict = {}):
        kmlNS = node.namespaceURI;
        dict['longitude'] = self.child_element_value(node, 'longitude', kmlNS)
        dict['latitude'] = self.child_element_value(node, 'latitude', kmlNS)
        dict['altitude'] = self.child_element_value(node, 'altitude', kmlNS)
        dict['heading'] = self.child_element_value(node, 'heading', kmlNS)
        dict['tilt'] = self.child_element_value(node, 'tilt', kmlNS)
        dict['roll'] = self.child_element_value(node, 'roll', kmlNS)
        dict['altitudeMode'] = self.child_element_value(node, 'altitudeMode', kmlNS)
        return dict
    
    def lookat_to_dict(self, node, dict = {}):
        kmlNS = node.namespaceURI;
        dict['longitude'] = self.child_element_value(node, 'longitude', kmlNS)
        dict['latitude'] = self.child_element_value(node, 'latitude', kmlNS)
        dict['altitude'] = self.child_element_value(node, 'altitude', kmlNS)
        dict['heading'] = self.child_element_value(node, 'heading', kmlNS)
        dict['tilt'] = self.child_element_value(node, 'tilt', kmlNS)
        dict['range'] = self.child_element_value(node, 'range', kmlNS)
        dict['altitudeMode'] = self.child_element_value(node, 'altitudeMode', kmlNS)
        return dict
        
    def abstractview_to_dict(self, node, dict = {}):
        if (node.tagName == 'Camera'):
            dict = self.camera_to_dict(node, dict)
        elif (node.tagName == 'LookAt'):
            dict = self.lookat_to_dict(node, dict)
        return dict
    
    def region_to_dict(self, node, dict = {}):
        kmlNS = node.namespaceURI
        latlonaltbox = self.child_element(node, 'LatLonAltBox', kmlNS)
        if (latlonaltbox != None):
            dict['latLonAltBox'] = self.kmlobject_to_dict(latlonaltbox, {})
        lod = self.child_element(node, 'Lod', kmlNS)
        if (lod != None):
            dict['lod'] = self.kmlobject_to_dict(lod, {})
        return dict
    
    def extendeddata_to_dict(self, node, dict = {}):
        print '***** Not implemented: %s' % node.tagName
        return dict
    
    def orientation_to_dict(self, node, dict = {}):
        print '***** Not implemented: %s' % node.tagName
        return dict
    
    def icon_to_dict(self, node, dict = {}):
        print '***** Not implemented: %s' % node.tagName
        return dict
    
    def location_to_dict(self, node, dict = {}):
        print '***** Not implemented: %s' % node.tagName
        return dict
    
    def scale_to_dict(self, node, dict = {}):
        print '***** Not implemented: %s' % node.tagName
        return dict
    
    def lod_to_dict(self, node, dict = {}):
        kmlNS = node.namespaceURI
        val = self.child_element_value(node, 'minLodPixels', kmlNS)
        if (val != None and len(val) > 0):
            dict['minLodPixels'] = float(val)
        val = self.child_element_value(node, 'maxLodPixels', kmlNS)
        if (val != None and len(val) > 0):
            dict['maxLodPixels'] = float(val)
        val = self.child_element_value(node, 'minFadeExtent', kmlNS)
        if (val != None and len(val) > 0):
            dict['minFadeExtent'] = float(val)
        val = self.child_element_value(node, 'maxFadeExtent', kmlNS)
        if (val != None and len(val) > 0):
            dict['maxFadeExtent'] = float(val)
        return dict
    
    def latlonbox_to_dict(self, node, dict = {}):
        print '***** Not implemented: %s' % node.tagName
        return dict
    
    def latlonaltbox_to_dict(self, node, dict = {}):
        kmlNS = node.namespaceURI
        val = self.child_element_value(node, 'north', kmlNS)
        if (val != None and len(val) > 0):
            dict['north'] = float(val)
        val = self.child_element_value(node, 'east', kmlNS)
        if (val != None and len(val) > 0):
            dict['east'] = float(val)
        val = self.child_element_value(node, 'south', kmlNS)
        if (val != None and len(val) > 0):
            dict['south'] = float(val)
        val = self.child_element_value(node, 'west', kmlNS)
        if (val != None and len(val) > 0):
            dict['west'] = float(val)
        dict['altitudeMode'] = self.child_element(node, 'altitudeMode', kmlNS)
        val = self.child_element(node, 'minAltitude', kmlNS)
        if (val != None and len(val) > 0):
            dict['minAltitude'] = float(val)
        val = self.child_element_value(node, 'maxAltitude', kmlNS)
        if (val != None and len(val) > 0):
            dict['maxAltitude'] = float(val)
        return dict
    
    def kmlobject_to_dict(self, node, dict = {}):
        dict['type'] = node.tagName
        dict['id'] = node.getAttribute('id')
        if (node.tagName in self.KML_FEATURE_NAMES):
            dict = self.feature_to_dict(node, dict)
        elif (node.tagName in self.KML_GEOMETRY_NAMES):
            dict = self.geometry_to_dict(node, dict)
        elif (node.tagName == 'Link'):
            dict = self.link_to_dict(node, dict)
        elif (node.tagName == 'Icon'):
            dict = self.icon_to_dict(node, dict)
        elif (node.tagName == 'Orientation'):
            dict = self.orientation_to_dict(node, dict)
        elif (node.tagName == 'Location'):
            dict = self.location_to_dict(node, dict)
        elif (node.tagName == 'Scale'):
            dict = self.scale_to_dict(node, dict)
        elif (node.tagName in self.KML_STYLESELECTOR_NAMES):
            dict = self.styleselector_to_dict(node, dict)
        elif (node.tagName in self.KML_TIMEPRIMITIVE_NAMES):
            dict = self.timeprimitive_to_dict(node, dict)
        elif (node.tagName in self.KML_ABSTRACTVIEW_NAMES):
            dict = self.abstractview_to_dict(node, dict)
        elif (node.tagName == 'Region'):
            dict = self.region_to_dict(node, dict)
        elif (node.tagName == 'Lod'):
            dict = self.lod_to_dict(node, dict)
        elif (node.tagName == 'LatLonBox'):
            dict = self.latlonbox_to_dict(node, dict)
        elif (node.tagName == 'LatLonAltBox'):
            dict = self.latlonaltbox_to_dict(node, dict)
        elif (node.tagName in self.KML_SUBSTYLE_NAMES):
            dict = self.substyle_to_dict(node, dict)
        else:
            raise ValueError('Unknown KML element: %s' % node.tagName)
        return dict
    
    def kml_to_dict(self, node, dict = {}, baseUrl = ''):
        if (node.nodeType != Node.ELEMENT_NODE):
            raise ValueError('Not an element node')
        if (node.namespaceURI not in self.KML_NAMESPACES):
            raise ValueError('Not a valid KML namespace: %s' % node.namespaceURI)
        if (node.tagName != 'kml'):
            raise ValueError('Expected kml, not %s' % node.tagName)
        
        dict['baseUrl'] = baseUrl
        dict['hint'] = node.getAttribute('hint')
        
        children = []
        for child in node.childNodes:
            if (child.nodeType == Node.ELEMENT_NODE
                and child.namespaceURI == node.namespaceURI):
                if (child.tagName in self.KML_OBJECT_NAMES):
                    childObject = self.kmlobject_to_dict(child, {})
                    children.append(childObject)
                else:
                    print 'WARNING: Unhandled KML element - %s' % child.tagName
        dict['children'] = children
        
        return dict