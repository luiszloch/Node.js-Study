function Shape(){
}

Shape.prototype.X = 0;
Shape.prototype.Y = 0;
	
Shape.prototype.move = function(x,y){		
	this.X = x;
	this.Y = y;
}
	
Shape.prototype.distance_from_origin = function(){
	return Math.sqrt(this.X * this.X + this.Y + this.Y);
}

/* var s = new Shape();
 * s.move (10,10);
 * console.log(s.distance_from_origin());
 */

function Square(){
}

Square.prototype = new Shape();
Square.prototype.__proto__ = Shape.prototype;
Square.prototype.Width = 0;
Square.prototype.area = function(){
	return this.Width * this.Width;
}	


var sq = new Square();
sq.move (-5,-5);
sq.Width = 10
console.log("Square area = " + sq.distance_from_origin());
console.log("Square distance from origin = " + sq.area());


function Rectangle(){
}

Rectangle.prototype = new Square();
Rectangle.prototype.__proto__ = Square.prototype;
Rectangle.prototype.Height = 0;
Rectangle.prototype.area = function(){
	return this.Width * this.Height;
}

var rt = new Rectangle();
rt.Width = 10;
rt.Height = 20;
rt.move(10,10);
console.log("Rectangle area = " + rt.area());
console.log("Rectangle distance from origin = " + rt.distance_from_origin());

console.log(sq instanceof Square);
console.log(sq instanceof Shape);
console.log(sq instanceof Rectangle);
console.log(rt instanceof Square);
console.log(rt instanceof Shape);

