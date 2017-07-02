const app = angular.module("graphicCourseHw", []);
app.controller("ctrl", function($scope) {
    $scope.workSpaceWidth = 500;
    $scope.workSpaceHeight = 350;
    $scope.regularPolygonNumberOfRibs = 5;
    $scope.currentOperation = "Line";
    $scope.color = "red";
    let clickedPoints = [];

    $scope.cleanWorkspace = function (){
        initialWorkSpace();
    };

    $scope.operationChange = function(opration) {
        $scope.currentOperation = opration;
    };

    function initialWorkSpace(){
        const workSpace = document.getElementById('workSpace');
        workSpace.width = $scope.workSpaceWidth;
        workSpace.height = $scope.workSpaceHeight;
        workSpace.borderStyle = "border:1px solid #000000";
        workSpace.onclick = function(event){
            onClickUnit(event.offsetX,event.offsetY)
        };
    }

    function onClickUnit(x, y) {
        putPixel(x,y);
        if($scope.currentOperation === "Point"){
            putPixel(x,y);
        }
        else if($scope.currentOperation === "Line"){
            drawLinePreparation(x,y)
        }
        else if($scope.currentOperation === "Cycle"){
            drawCyclePreparation(x,y)
        }
        else if($scope.currentOperation ==="Regular polygon"){
            drawRegularPolygonPreparation(x,y)
        }
        else if($scope.currentOperation ==="Draw curves"){
            drawCurvesPreparation(x,y)
        }
    }

    function drawLinePreparation(x,y) {
        clickedPoints.push({
            x:x,
            y:y
        });
        if(clickedPoints.length === 2){
            drawLine(clickedPoints[0].x,clickedPoints[0].y,clickedPoints[1].x,clickedPoints[1].y);
            clickedPoints = clearPixels(clickedPoints);
        }
    }

    function drawCyclePreparation(x,y) {
        clickedPoints.push({
            x:x,
            y:y
        });
        if(clickedPoints.length === 2){
            drawCycle(clickedPoints[0].x,clickedPoints[0].y,clickedPoints[1].x,clickedPoints[1].y);
            clickedPoints = clearPixels(clickedPoints);
        }
    }

    function  drawRegularPolygonPreparation(x,y){
        clickedPoints.push({
            x:x,
            y:y
        });
        if(clickedPoints.length === 2){
            drawRegularPolygon(clickedPoints[0].x,clickedPoints[0].y,clickedPoints[1].x,clickedPoints[1].y,
                $scope.regularPolygonNumberOfRibs);
            clickedPoints = clearPixels(clickedPoints);
        }
    }

    function drawCurvesPreparation(x,y) {
        clickedPoints.push({
            x:x,
            y:y
        });
        if(clickedPoints.length === 4){
            drawCurves(
                clickedPoints[0].x,clickedPoints[0].y,
                clickedPoints[3].x,clickedPoints[3].y,
                clickedPoints[2].x,clickedPoints[2].y,
                clickedPoints[1].x,clickedPoints[1].y
            );
            clickedPoints = clearPixels(clickedPoints);
        }
    }

    function drawCurves(x1,y1,x2,y2,x3,y3,x4,y4) {
        let matrix = math.matrix([
            [-1, 3,-3, 1],
            [ 3,-6, 3, 0],
            [-3, 3, 0, 0],
            [ 1, 0, 0, 0],
        ]);
        let step = 0.1;
        let lastX = 0;
        let lastY = 0;
        let matrixX = math.matrix([x1,x2,x3,x4]);
        let matrixY = math.matrix([y1,y2,y3,y4]);
        for( let i = 0 ; i < 1 ; i += step ){
            let t =  [i*i*i,i*i,i,1];
            let temp = math.multiply(t,matrix);
            let x = math.multiply(temp,matrixX);
            let y = math.multiply(temp,matrixY);
            if(i !== 0){
                drawLine(lastX,lastY,x,y);
            }
            lastX = x;
            lastY = y;
        }
    }

    function drawRegularPolygon(coordXCenter, coordYCenter, coordXPoint, coordYPoint,numberOfRibs) {
        const radius =  calculateDistance(coordXCenter, coordYCenter, coordXPoint, coordYPoint);
        const theta = 350.00 / numberOfRibs;
        let points = [];
        //calculate polygon points
        for (let i = 1; i <= numberOfRibs; i++) {
            points.push({
                x:radius * Math.cos(2*Math.PI*i/numberOfRibs + theta) + coordXCenter,
                y:radius * Math.sin(2*Math.PI*i/numberOfRibs + theta) + coordYCenter
            })
        }
        //draw lines between polygon points
        for(let i = 0; i <= numberOfRibs - 1; i++){
            if(i !== (numberOfRibs - 1)){
                drawLine(points[i].x,points[i].y,points[i + 1].x,points[i + 1].y);
            }
            else{
                drawLine(points[i].x,points[i].y,points[0].x,points[0].y);
            }

        }
    }

    function drawCycle (coordXCenter, coordYCenter, coordXPoint, coordYPoint) {
        const radius = calculateDistance(coordXCenter, coordYCenter, coordXPoint, coordYPoint);
        let x = 0;
        let y = radius;
        let delta = 1 - 2 * radius;
        let error = 0;
        while (y >= 0){
            putPixel(coordXCenter + x, coordYCenter + y);
            putPixel(coordXCenter + x, coordYCenter - y);
            putPixel(coordXCenter - x, coordYCenter + y);
            putPixel(coordXCenter - x, coordYCenter - y);
            error = 2 * (delta + y) - 1;
            if ((delta < 0) && (error <= 0))
            {
                delta += 2 * ++x + 1;
                continue;
            }
            error = 2 * (delta - x) - 1;
            if ((delta > 0) && (error > 0)){
                delta += 1 - 2 * --y;
                continue;
            }
            x++;
            delta += 2 * (x - y);
            y--
        }
    }

    function drawLine (coordXStart, coordYStart, coordXEnd, coordYEnd) {
        let  stepX, stepY, es, el;

        let deltaX = coordXEnd - coordXStart;
        let deltaY = coordYEnd - coordYStart;

        let directionX = sign(deltaX);

        let directionY = sign(deltaY);

        deltaX = Math.abs(deltaX);
        deltaY = Math.abs(deltaY);

        if (deltaX > deltaY) {
            stepX = directionX;
            stepY = 0;
            es = deltaY;
            el = deltaX;
        }
        else {
            stepX = 0;
            stepY = directionY;
            es = deltaX;
            el = deltaY;
        }

        let x = coordXStart;
        let y = coordYStart;
        let error = el/2;

        for (let i = 0; i < el; i++) {
            error -= es;
            if (error < 0)
            {
                error += el;
                x += directionX;
                y += directionY;
            }
            else
            {
                x += stepX;
                y += stepY;
            }
            putPixel(x, y);
        }
    }

    function putPixel(coordX,coordY) {
        const canvas = document.getElementById("workSpace");
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = $scope.color;
        ctx.fillRect(coordX,coordY,1,1);
    }

    function clearPixel(coordX,coordY) {
        const canvas = document.getElementById("workSpace");
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "white";
        ctx.fillRect(coordX,coordY,1,1);
    }

    function clearPixels(array){
        array.forEach(function (pixel) {
            clearPixel(pixel.x,pixel.y);
        });
        array = [];
        return array;
    }

    function calculateDistance(x1,y1,x2,y2) {
        return Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2))
    }

    function  sign (number) {
        return (number > 0) ? 1 : (number < 0) ? -1 : 0;
    }

    window.onload = function () {
        initialWorkSpace();
    };

});