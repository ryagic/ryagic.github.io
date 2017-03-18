var endTime;
var interval;
var canvasSize = 800;

const hourTicks = 1 * 60 * 60 * 1000;
const LIGHT_COLOR = '#f9eb25';
const DARK_COLOR = '#bc8a25'
const CENTER_COLOR = '#bc5e16'
const RING_RADIUS = 50;

window.onload = function () {
	var canvas = document.getElementById('clock');
	canvas.width  = canvas.offsetWidth;
	canvas.height = canvas.offsetHeight;
	startTimer();
	drawClock();
	stopTimer();
	$("#stop").hide();
	$("#time").val(60);
}

function startTimer() {
	var ticks = $("#time").val() * 60 * 1000;
	
	if (ticks <=0) ticks = hourTicks;
	
	endTime = new Date();
	endTime.setTime(new Date().getTime() + ticks);
	
	interval = setInterval(drawClock, 24);
	
	$("#stop").show();
	$("#start").hide();
	$("#time").hide();
}

function stopTimer() {
	clearInterval(interval);
	var pausedTime = (endTime.getTime() - new Date().getTime()) / 60 / 1000;
	if (pausedTime < 0) pausedTime = 0;
	
	$("#stop").hide();
	$("#start").show();
	$("#time").show();
	$("#time").val(pausedTime.toFixed(3));
}

function drawClock() {
	var ticksLeft = endTime.getTime() - new Date().getTime();
	if (ticksLeft < 0) ticksLeft = 0;
	
	var canvas = document.getElementById('clock');
	var ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	var percent = ticksLeft / hourTicks;
	drawRings(percent, ctx);
	drawNubs(Math.floor(12 * percent), ticksLeft == 0, ctx);
	drawOuterBorder(ctx);
	drawText(ticksLeft, ctx);
	
	if (ticksLeft == 0) {
		stopTimer();
		var audio = new Audio('Game-over-yeah.mp3');
		audio.play();
	}
}

function drawOuterBorder(context) {
	//Outer border
	context.shadowColor = '#333';
	context.shadowBlur = 8;
	context.shadowOffsetX = -2;
	context.shadowOffsetY = 3;
	
	context.beginPath();
	context.arc(getXCenter(), getYCenter(), getYCenter() - 5, 0, 2 * Math.PI, false);
	context.lineWidth = 7;
	context.strokeStyle = '#aaaaaa';
	context.stroke();
}

function drawNubs(count, expired, context) {
	if (count > 11) count = 11;

	context.shadowColor = '#333';
	context.shadowBlur = 8;
	context.shadowOffsetX = -2;
	context.shadowOffsetY = 5;
	
	var distance = getYCenter() - RING_RADIUS / 2 - 10;
	for (var i = 1; i <= count; i++) {
		var angle = Math.PI / 2 - i / 12 * 2 * Math.PI;
		var x = getXCenter() + distance * Math.cos(angle);
		var y = getYCenter() - distance * Math.sin(angle);

		context.beginPath();
		context.arc(x, y, 5, 0, 2 * Math.PI, false);
		context.lineWidth = 5;
		context.fillStyle = CENTER_COLOR;
		context.strokeStyle = CENTER_COLOR;
		context.fill();
	}
	
	//Top triangle
	context.shadowBlur = 0;
	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;
	context.lineWidth = 3;
	context.strokeStyle = '#333333';
	context.fillStyle = !expired ? CENTER_COLOR : "#e5391b";
	
	context.beginPath();
	var x = getXCenter();
	var y = RING_RADIUS + 12;
	context.moveTo(x, y);
	context.lineTo(x + RING_RADIUS / 2, y - RING_RADIUS);
	context.lineTo(x - RING_RADIUS / 2, y - RING_RADIUS);
	context.lineTo(x, y);
	context.fill();
	context.stroke();
}

function drawText(ticksLeft, context){
	var milliseconds = Math.floor((ticksLeft % 1000) / 10);
	var seconds = Math.floor((ticksLeft / 1000) % 60);
	var minutes = Math.floor(ticksLeft / 60000);

	context.shadowBlur = 1;
	context.shadowOffsetX = 5;
	context.shadowOffsetY = 3;
	context.shadowColor = ticksLeft > (1000 * 5 * 60) ? "#a03209" : "#2d0300";
	
	var fontHeight = 156;
	context.font = fontHeight + "px clockFont";
	context.fillStyle = ticksLeft > (1000 * 5 * 60) ? LIGHT_COLOR : "#d31d10";
	var text = padNumber(minutes) + ":" + padNumber(seconds) + ":" + padNumber(milliseconds);
	context.fillText(text, getXCenter() - context.measureText(text).width / 2, getYCenter() + fontHeight / 4);
}

function drawRings(percent, context) {
	//Inner border
	context.beginPath();
	context.arc(getXCenter(), getYCenter(), getYCenter() - RING_RADIUS - 12, 0, 2 * Math.PI, false);
	context.lineWidth = 2;
	
	var gradient = context.createLinearGradient(getXCenter() * 1.5, getYCenter() / 2, getXCenter() / 2, getYCenter() * 1.5);
	gradient.addColorStop(0,"#602b08");
	gradient.addColorStop(1,"#bc5e16");
	context.fillStyle = gradient;
	context.strokeStyle = '#666666';
	context.fill();
	
	//Dark ring
	context.shadowColor = '#333';
	context.shadowBlur = 25;
	context.shadowOffsetX = -10;
	context.shadowOffsetY = 15;
	
	context.beginPath();
	context.arc(getXCenter(), getYCenter(), getYCenter() - RING_RADIUS / 2 - 10, 0, 2 * Math.PI, false);
	context.lineWidth = RING_RADIUS;
	context.strokeStyle = DARK_COLOR;
	context.stroke();
	
	//Light Ring
	var endAngle = (1.5 + 2 * percent) * Math.PI;
	if (endAngle > 2 * Math.PI) endAngle -= 2 * Math.PI;
	
	context.shadowBlur = 0;
	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;

	context.beginPath();
	context.arc(getXCenter(), getYCenter(), getYCenter() - RING_RADIUS / 2 - 10, 1.5 * Math.PI, endAngle, false);
	context.lineWidth = RING_RADIUS;
	context.strokeStyle = LIGHT_COLOR;
	context.stroke();
}

function getXCenter() {
	return $("#clock").width() / 2;
}

function getYCenter() {
	return $("#clock").height() / 2;
}

function padNumber(unpadded){
	if (unpadded >= 10) return unpadded.toString();
	if (unpadded > 0) return "0" + unpadded.toString();
	
	return "00";
}