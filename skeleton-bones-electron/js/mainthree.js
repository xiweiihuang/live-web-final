(function(){

  var Kinect2 = require('../../lib/kinect2');
  var kinect = new Kinect2();

  var FACTOR = 400;

  var renderer, camera, scene, controls;
  var rootBone;
  var faceColors = [
    0xff0000,
    0x00ff00,
    0x0000ff,
    0xffff00,
    0x00ffff,
    0xff00ff
  ];

  function init() {
    renderer = new THREE.WebGLRenderer( {
      canvas: document.getElementById('outputCanvas'),
      alpha: 1, antialias: true, clearColor: 0xffffff
    } );

    camera = new THREE.PerspectiveCamera( 40, renderer.domElement.width / renderer.domElement.height, 1, 10000 );
    camera.position.set( 0, 300, 2500 );
    controls = new THREE.TrackballControls( camera, renderer.domElement );

    scene = new THREE.Scene();

    createGrid();
    createBoneHierarchy();
    createBoneAndChildren(rootBone);

    window.addEventListener( 'resize', onWindowResize, false );
    onWindowResize();
    render();

    if(kinect.open()){
      kinect.on('bodyFrame', processBodyFrame);
      kinect.openBodyReader();
    }
  }

  function createGrid() {
    // ground box
    var geometry = new THREE.BoxGeometry( 500, 2, 500 );
    material = new THREE.MeshNormalMaterial();
    var mesh = new THREE.Mesh( geometry, material );
    mesh.position.set( 0, -1, 0 );
    scene.add( mesh );
    mesh = new THREE.GridHelper( 250, 10 );
    scene.add( mesh );

    // axes
    var axis = new THREE.AxisHelper( 250 );
    scene.add( axis );
    renderer.render( scene, camera );

    var geometry = new THREE.BoxGeometry( 50, 20, 50 );
    var material = new THREE.MeshNormalMaterial();
    var box = new THREE.Mesh( geometry, material );
    scene.add( box );
  }

  function createBoneHierarchy() {
    var lengthFromSpineBaseToSpineMid = FACTOR * 0.2;
    var lengthFromSpineMidToSpineShoulder = FACTOR * 0.2;
    var lengthFromSpineMidToHipRight = FACTOR * 0.1;
    var lengthFromHipRightToKneeRight = FACTOR * 0.3;
    var lengthFromKneeRightToAnkleRight = FACTOR * 0.2;
    var lengthFromAnkleToFoot = FACTOR * 0.1;
    var lengthFromShoulderToNeck = FACTOR * 0.05;
    var lengthFromNeckToHead = FACTOR * 0.1;
    var lengthFromSpineShoulderToShoulder = FACTOR * 0.2;
    var lengthFromShoulderToElbow = FACTOR * 0.3;
    var lengthFromElbowToWrist = FACTOR * 0.2;
    var lengthFromWristToHand = FACTOR * 0.05;
    var lengthFromHandToThumb = FACTOR * 0.05;
    var lengthFromHandToTip = FACTOR * 0.05;

    rootBone = { index: Kinect2.JointType.spineBase, length: 1 };
    var spineMidBone = { index: Kinect2.JointType.spineMid, length: 1 };
    var neckBone = { index: Kinect2.JointType.neck, length: 1 };
    var headBone = { index: Kinect2.JointType.head, length: 1 };
    var shoulderLeftBone = { index: Kinect2.JointType.shoulderLeft, length: 1 };
    var elbowLeftBone = { index: Kinect2.JointType.elbowLeft, length: 1 };
    var wristLeftBone = { index: Kinect2.JointType.wristLeft, length: 1 };
    var handLeftBone = { index: Kinect2.JointType.handLeft, length: 1 };
    var shoulderRightBone = { index: Kinect2.JointType.shoulderRight, length: 1 };
    var elbowRightBone = { index: Kinect2.JointType.elbowRight, length: 1 };
    var wristRightBone = { index: Kinect2.JointType.wristRight, length: 1 };
    var handRightBone = { index: Kinect2.JointType.handRight, length: 1 };
    var hipLeftBone = { index: Kinect2.JointType.hipLeft, length: 1 };
    var kneeLeftBone = { index: Kinect2.JointType.kneeLeft, length: 1 };
    var ankleLeftBone = { index: Kinect2.JointType.ankleLeft, length: 1 };
    var footLeftBone = { index: Kinect2.JointType.footLeft, length: 1 };
    var hipRightBone = { index: Kinect2.JointType.hipRight, length: 1 };
    var kneeRightBone = { index: Kinect2.JointType.kneeRight, length: 1 };
    var ankleRightBone = { index: Kinect2.JointType.ankleRight, length: 1 };
    var footRightBone = { index: Kinect2.JointType.footRight, length: 1 };
    var spineShoulderBone = { index: Kinect2.JointType.spineShoulder, length: 1 };
    var handTipLeftBone = { index: Kinect2.JointType.handTipLeft, length: 1 };
    var thumbLeftBone = { index: Kinect2.JointType.thumbLeft, length: 1 };
    var handTipRightBone = { index: Kinect2.JointType.handTipRight, length: 1 };
    var thumbRightBone = { index: Kinect2.JointType.thumbRight, length: 1 };

    addChildBone(rootBone, hipRightBone, lengthFromSpineMidToHipRight);
    addChildBone(hipRightBone, kneeRightBone, lengthFromHipRightToKneeRight);
    addChildBone(kneeRightBone, ankleRightBone, lengthFromKneeRightToAnkleRight);
    addChildBone(ankleRightBone, footRightBone, lengthFromAnkleToFoot);

    addChildBone(rootBone, hipLeftBone, lengthFromSpineMidToHipRight);
    addChildBone(hipLeftBone, kneeLeftBone, lengthFromHipRightToKneeRight);
    addChildBone(kneeLeftBone, ankleLeftBone, lengthFromKneeRightToAnkleRight);
    addChildBone(ankleLeftBone, footLeftBone, lengthFromAnkleToFoot);

    addChildBone(rootBone, spineMidBone, lengthFromSpineBaseToSpineMid);
    addChildBone(spineMidBone, spineShoulderBone, lengthFromSpineMidToSpineShoulder);

    addChildBone(spineShoulderBone, neckBone, lengthFromShoulderToNeck);
    addChildBone(neckBone, headBone, lengthFromNeckToHead);

    addChildBone(spineShoulderBone, shoulderRightBone, lengthFromSpineShoulderToShoulder);
    addChildBone(shoulderRightBone, elbowRightBone, lengthFromShoulderToElbow);
    addChildBone(elbowRightBone, wristRightBone, lengthFromElbowToWrist);
    addChildBone(wristRightBone, handRightBone, lengthFromWristToHand);
    addChildBone(wristRightBone, thumbRightBone, lengthFromHandToThumb);
    addChildBone(handRightBone, handTipRightBone, lengthFromHandToTip);

    addChildBone(spineShoulderBone, shoulderLeftBone, lengthFromSpineShoulderToShoulder);
    addChildBone(shoulderLeftBone, elbowLeftBone, lengthFromShoulderToElbow);
    addChildBone(elbowLeftBone, wristLeftBone, lengthFromElbowToWrist);
    addChildBone(wristLeftBone, handLeftBone, lengthFromWristToHand);
    addChildBone(wristLeftBone, thumbLeftBone, lengthFromHandToThumb);
    addChildBone(handLeftBone, handTipLeftBone, lengthFromHandToTip);
  }

  function addChildBone(parentBone, childBone, length) {
    if(!parentBone.children) {
      parentBone.children = [];
    }
    parentBone.children.push(childBone);
    childBone.parent = parentBone;
    childBone.length = length;
  }

  function createBoneAndChildren(bone) {
    var geometry = new THREE.BoxGeometry( FACTOR / 10,bone.length, FACTOR / 10 );
    geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, bone.length/2, 0 ) );
    for(var i = 0; i < geometry.faces.length; i++) {
      geometry.faces[i].color.setHex(faceColors[Math.floor(i / 2)]);
    }

    var material = new THREE.MeshBasicMaterial( { color: 0xffffff, vertexColors: THREE.FaceColors } )

    var cube = new THREE.Mesh( geometry, material );
    scene.add( cube );
    bone.mesh = cube;
    bone.mesh.matrixAutoUpdate = false;
    if(bone.children) {
      bone.children.forEach(function(child){
        createBoneAndChildren(child);
      });
    }
  }

  var frameNr = 0;
  function processBodyFrame(bodyFrame) {
    var index = 0;
    bodyFrame.bodies.forEach(function(body){
      if(body.tracked) {
        //traverse hierarchy
        applyBoneTransformations(body, rootBone);
      }
    });
  }

  function applyBoneTransformations(body, bone) {
    var joint = body.joints[bone.index];
    var parentBone = bone.parent;
    var translation,
      rotation = new THREE.Quaternion(joint.orientationX, joint.orientationY, joint.orientationZ, joint.orientationW),
      scale = new THREE.Vector3(1, 1, 1);

    if(parentBone) {
      translation = new THREE.Vector4(0, parentBone.length, 0, 1);
      translation.applyMatrix4(parentBone.mesh.matrix);
    } else {
      //we are a root bone - position is absolute
      translation = new THREE.Vector3(joint.cameraX * FACTOR, joint.cameraY * FACTOR, joint.cameraZ * FACTOR);
    }

    bone.mesh.matrix.compose(translation, rotation, scale);

    if(bone.children) {
      bone.children.forEach(function(child){
        applyBoneTransformations(body, child);
      });
    }
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
  }

  function render() {
    renderer.render( scene, camera );
    controls.update();
    requestAnimationFrame(render);
  }

  init();

})();
