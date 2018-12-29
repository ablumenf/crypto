var app = angular.module('app', []);
const maxQueueSize = 8;
app.controller('ctrl', function($scope) {
	$scope.p = findPrime();
	$scope.g = findPrimRoot($scope.p);
	$scope.x = randomInt(1, $scope.p-1);
	$scope.y = randomInt(1, $scope.p);

	let outputQueue = [];
	const outputElement = document.getElementById("dlOutput");
	const alertSelector = "#dlAlert";

	$scope.$watch("p", function(newValue, oldValue) {
		$scope.p = parseInt(newValue);
		$scope.g = trueMod($scope.g, $scope.p);
		$scope.x = trueMod($scope.x, $scope.p - 1);
		$scope.y = trueMod($scope.y, $scope.p);
		if(isNaN(newValue) || !Number.isInteger(parseFloat(newValue))) {
			showAlert(invalidInt("p", false), alertSelector);
			$scope.p = findPrime();
			return;
		}
		if(parseInt(newValue) === parseInt(oldValue)) return;
		if(!isPrime($scope.p)) {
			showAlert("Your choice of <span class='texUpdate' content='p'></span> is not a prime. Random prime chosen instead.", alertSelector);
			$scope.p = findPrime();
			return;
		}
		enqueue("p set to " + newValue, outputQueue);
	 	printQueue(outputQueue, outputElement);
	});

	$scope.$watch("g", function(newValue, oldValue) {
		$scope.g = parseInt(newValue);
		if(newValue === oldValue) return;
		if(isNaN(newValue) || !Number.isInteger(parseFloat(newValue))) {
			showAlert(invalidInt("g", false), alertSelector);
			$scope.g = findPrimRoot($scope.p);
			return;
		}
		enqueue("g set to " + newValue, outputQueue);
	 	printQueue(outputQueue, outputElement);
	});

	$scope.$watch("x", function(newValue, oldValue) {
		$scope.x = parseInt(trueMod(newValue, $scope.p - 1));
		if(newValue === oldValue) return;
		if(isNaN(newValue) || !Number.isInteger(parseFloat(newValue))) {
			showAlert(invalidInt("x", false), alertSelector);
			$scope.x = randomInt(1, $scope.p-1);
			return;
		}
		enqueue("x set to " + newValue, outputQueue);
	 	printQueue(outputQueue, outputElement);
	});

	$scope.$watch("y", function(newValue, oldValue) {
		$scope.y = parseInt(trueMod(newValue, $scope.p));
		if(newValue === oldValue) return;
		if(isNaN(newValue) || !Number.isInteger(parseFloat(newValue))) {
			showAlert(invalidInt("y", false), alertSelector);
			$scope.y = randomInt(1, $scope.p);
			return;
		}
		enqueue("y set to " + newValue, outputQueue);
	 	printQueue(outputQueue, outputElement);
	});

	function findPrime() {
		const dist = [0.1, 0.4, 0.8, 0.95, 1];
		let index = 0;
		const rand = Math.random();
		while(rand > dist[index]) {
			index++;
		}
		return randomPrime(index+1);
	}

	$scope.generatePrime = function() {
		$scope.p = findPrime();
	};

	$scope.generatePrimRoot = function() {
		$scope.g = findPrimRoot($scope.p);
	};

	$scope.order = function() {
		enqueue("Order(" + $scope.g + ") (mod " + $scope.p + ") = " + order($scope.g, $scope.p), outputQueue);
		printQueue(outputQueue, outputElement);
	};

	$scope.modExp = function() {
		enqueue("<span class='texUpdate' content='" + $scope.g + "^{" + $scope.x + "} \\bmod{" + $scope.p + "} = " + modExp($scope.g, $scope.x, $scope.p) + "'></span>", outputQueue);
		printQueue(outputQueue, outputElement);
	};

	$scope.log = function() {
		const result = discreteLog($scope.g, $scope.y, $scope.p);
		if(result === -1) {
			showAlert("<span class='texUpdate' content='" + $scope.g + "^x \\equiv " + $scope.y + " \\pmod{" + $scope.p + "} has no solution'></span>", alertSelector);
		} else {
			enqueue("<span class='texUpdate' content='\\log_{" + $scope.g + "}(" + $scope.y + ") \\pmod{" + ($scope.p - 1) + "} = " + result + "'></span>", outputQueue);
			printQueue(outputQueue, outputElement);
		}
	};

	$scope.clearOutput = function() {
		outputQueue = [];
		printQueue(outputQueue, outputElement);
	};
});