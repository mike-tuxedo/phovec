
function addAnchor(group, x, y, name) {
  var stage = group.getStage();
  var layer = group.getLayer();

  var anchor = new Kinetic.Circle({
    x: x,
    y: y,
    stroke: '#666',
    fill: '#ddd',
    strokeWidth: 2,
    radius: 8,
    name: name,
    draggable: true,
    dragOnTop: false
  });

  anchor.on('dragmove', function() {
    update(this);
    layer.draw();
  });
  anchor.on('mousedown touchstart', function() {
    group.setDraggable(false);
    this.moveToTop();
  });
  anchor.on('dragend', function() {
    group.setDraggable(true);
    layer.draw();
  });
  // add hover styling
  anchor.on('mouseover', function() {
    var layer = this.getLayer();
    document.body.style.cursor = 'pointer';
    this.setStrokeWidth(4);
    layer.draw();
  });
  anchor.on('mouseout', function() {
    var layer = this.getLayer();
    document.body.style.cursor = 'default';
    this.setStrokeWidth(2);
    layer.draw();
  });

  group.add(anchor);
}

/* setup stage and snapshot-group */
function initStage(snapshot) {

  window.stage = new Kinetic.Stage({
    container: 'container',
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  window.snapShotGroup = new Kinetic.Group({
    x: 0,
    y: 0,
    draggable: true
  });
  var layer = new Kinetic.Layer();

  layer.add(snapShotGroup);
  stage.add(layer);

  var snapshotImg = new Kinetic.Image({
    x: 0,
    y: 0,
    image: snapshot,
    width: window.innerWidth,
    height: window.innerHeight,
    name: 'snapshot'
  });

  snapShotGroup.add(snapshotImg);
  addAnchor(snapShotGroup, 0, 0, 'topLeft');
  addAnchor(snapShotGroup, window.innerWidth, 0, 'topRight');
  addAnchor(snapShotGroup, window.innerWidth, window.innerHeight, 'bottomRight');
  addAnchor(snapShotGroup, 0, window.innerHeight, 'bottomLeft');

  snapShotGroup.on('dragstart', function() {
    this.moveToTop();
  });

  stage.draw();
  window.dispatchEvent(new CustomEvent("snapshotStage:created"));
}

function update(activeAnchor) {
  var group = activeAnchor.getParent();

  var topLeft = group.get('.topLeft')[0];
  var topRight = group.get('.topRight')[0];
  var bottomRight = group.get('.bottomRight')[0];
  var bottomLeft = group.get('.bottomLeft')[0];
  var image = group.get('.snapshot')[0];

  var anchorX = activeAnchor.getX();
  var anchorY = activeAnchor.getY();

  // update anchor positions
  switch (activeAnchor.getName()) {
    case 'topLeft':
      topRight.setY(anchorY);
      bottomLeft.setX(anchorX);
      break;
    case 'topRight':
      topLeft.setY(anchorY);
      bottomRight.setX(anchorX);
      break;
    case 'bottomRight':
      bottomLeft.setY(anchorY);
      topRight.setX(anchorX); 
      break;
    case 'bottomLeft':
      bottomRight.setY(anchorY);
      topLeft.setX(anchorX); 
      break;
  }

  image.setPosition(topLeft.getPosition());

  var width = topRight.getX() - topLeft.getX();
  var height = bottomLeft.getY() - topLeft.getY();
  if(width && height) {
    image.setSize(width, height);
  }
}

var originalCodedSnapshot = window.snapshotImage;

var alteredSnapshot = new Image();
alteredSnapshot.onload = function(){
  initStage(alteredSnapshot);
};
alteredSnapshot.src = window.snapshotImage;
