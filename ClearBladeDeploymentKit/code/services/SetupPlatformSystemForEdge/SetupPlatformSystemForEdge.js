DEBUG = {
  enabled: false,
  payload: {
    "PLATFORM": {
        "flow": "PRECONFIGURED",
        "platformURL": "https://amd.clearblade.com"
    },
    "DEVELOPER": {
        "devEmail": new String(+(new Date())) + "@gmail.com",
        "devPassword": "a",
        "flow": "NEW",
        "key":"AMDBlade"
    },
    "SYSTEM": {
        "system": "smart-monitoring",
        "flow": "IPM",
        "entrypoint":{portal:"smart-monitoring"}
    },
    "EDGE": {
        "edgeID": "abc",
        "flow": "NEW"
    }
}
}
/**
 * This does a lot
 * 
 * Desired Flow: { PLATFORM: PRECONFIGURED, DEVELOPER:NEW, SYSTEM:IPM, EDGE:NEW }
 * 
 * @param {ProvisionConfig}
 * 
 */
function SetupPlatformSystemForEdge(req, resp) {
  
  if (DEBUG.enabled) {
    log("Warning: DEBUG Enabled")
    req.params = DEBUG.payload
  }

  const provisionConfig = req.params
  log(provisionConfig)
  const flowMap = CONFIGURATION.WORKFLOW_MAP;

  setupPlatform()
    .then(setupDeveloper)
    .then(setupSystem)
    .then(getEntrypointURL)
    .then(setupEdge)
    .then(retarget)
    .then(finish)
    .catch(badThings)


  function setupPlatform() {
    var flow = provisionConfig.PLATFORM.flow
    return flowMap.PLATFORM[flow](provisionConfig)
  }

  function setupDeveloper(rest) {
    var flow = provisionConfig.DEVELOPER.flow;
    return flowMap.DEVELOPER[flow](rest, provisionConfig)
  }

  function setupSystem(rest) {
    var flow = provisionConfig.SYSTEM.flow
    return flowMap.SYSTEM[flow](rest, provisionConfig)
  }

  function getEntrypointURL(response){
    var deferred = Q.defer();
    deferred.resolve(response);
    return deferred.promise;
    log("a")
    var rest = response.rest
        log("a")
    var systemDetails = response.systemDetails
        log("a")
    var systemKey = systemDetails.systemKey
        log("a")
    var systemSecret = systemDetails.systemSecret
        log("a")
    var portalName = provisionConfig.SYSTEM.entrypoint.portal;
        log("a")
    var deferred = Q.defer()
    rest.getEncodedPortalURL(systemKey, systemSecret, portalName).then(function(raw){
        try{
          json = JSON.parse(raw)
          log("got url: " + json.url)
          response.systemDetails.entrypoint = {portal:json.url}
          deferred.resolve(response)

        }
        catch(e){
          log("Unable to parse portal url response: " + raw)
          deferred.reject(e)
        }

    })
    return deferred.promise;
  }
  function setupEdge(edgeRetargetCreds) {
    var flow = provisionConfig.EDGE.flow
    return flowMap.EDGE[flow](edgeRetargetCreds, provisionConfig)
  }


  function retarget(edgeRetargetCreds){
    log({edgeRetargetCreds})
    var rest = edgeRetargetCreds.rest
    var edgeDetails = edgeRetargetCreds.edgeDetails
    var systemDetails = edgeRetargetCreds.systemDetails
    var systemKeyOverride = edgeDetails.system_key
    var edgeID = edgeDetails.name
    var edgeToken = edgeDetails.token
    var platformIPOverride = edgeDetails.platformURL
    adaptersRootDir= "."
    mqttPort = "unused"
    log("About to retarget")
    log("A")
    log(typeof rest.retarget)
    log("A")
    var deferred = Q.defer();
    log("A")
    var cb = ClearBlade.init({request:req})
    log("A")
    if( ! ClearBlade.isEdge() ){
    log("A")
      log("Skipping retarget on platform")
      deferred.resolve(systemDetails)
      return deferred.promise;
    }
    log("A")
    log("Proceeding as Edge")
    rest.retarget(platformIPOverride, systemKeyOverride, edgeID, edgeToken, adaptersRootDir, mqttPort).then(function(err, data){
        deferred.resolve(systemDetails)
    })
    .catch(function(){
      deferred.reject("Failed to retarget")
    })
    return deferred.promise;
  }

  function finish(systemDetails) {
    log({systemDetails})
    log("Completed")
    resp.success(systemDetails)
  }

  function badThings(handsUpInTheAir) {
    var msg = "Caught Promise Error: " + JSON.stringify(handsUpInTheAir)
    log(msg)
    resp.error(handsUpInTheAir)
  }
}