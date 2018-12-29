var app = angular.module('app', []);
const maxQueueSize = 15;
app.controller('ctrl', function($scope) {
	$scope.p = randomPrime(randomInt(1, 9));
	$scope.n = randomInt(1, 1001);
	$scope.a = randomInt(1, 1001);
	$scope.b = randomInt(1, 1001);
	$scope.k = randomInt(1, 301);

	$scope.polys = polysToParse.map(parsePolyFromList);
	$scope.R = $scope.polys[1]; // $z^3 + z + 1

	$scope.P = polyString(polyMod(randomPoly(10), Polynomial($scope.R)));
	$scope.Q = polyString(polyMod(randomPoly(10), Polynomial($scope.R)));

	let outputQueue = [];
	const outputElement = document.getElementById("numTheoryOutput");
	const alertSelector = "#numTheoryAlert";

	$scope.$watch("p", function(newValue, oldValue) {
		if(newValue === oldValue) return;
		if(isNaN(newValue) || !Number.isInteger(parseFloat(newValue))) {
			showAlert(invalidInt("p", false), alertSelector);
			$scope.p = randomPrime(randomInt(1, 9));
			return;
		}
		if(!isPrime(parseInt(newValue))) {
			showAlert(newValue + " is not prime. Choosing new random <span class='texUpdate' content='p'></span>.", alertSelector);
			$scope.p = randomPrime(randomInt(1, 9));
			return;
		}
		$scope.p = parseInt($scope.p);
		enqueue("p changed to " + $scope.p, outputQueue);
	 	printQueue(outputQueue, outputElement);
	});

	$scope.$watch("a", function(newValue, oldValue) {
		if(newValue === oldValue) return;
		if(isNaN(newValue) || !Number.isInteger(parseFloat(newValue))) {
			showAlert(invalidInt("a", false), alertSelector);
			$scope.a = randomInt(1, 1001);
			return;
		}
		$scope.a = parseInt($scope.a);
		enqueue("a changed to " + $scope.a, outputQueue);
	 	printQueue(outputQueue, outputElement);
	});

	$scope.$watch("b", function(newValue, oldValue) {
		if(newValue === oldValue) return;
		if(isNaN(newValue) || !Number.isInteger(parseFloat(newValue))) {
			showAlert(invalidInt("b", false), alertSelector);
			$scope.b = randomInt(1, 1001);
			return;
		}
		$scope.b = parseInt($scope.b);
		enqueue("b changed to " + $scope.b, outputQueue);
	 	printQueue(outputQueue, outputElement);
	});

	$scope.$watch("n", function(newValue, oldValue) {
		if(newValue === oldValue) return;
		if(isNaN(newValue) || !Number.isInteger(parseFloat(newValue))) {
			showAlert(invalidInt("n", false), alertSelector);
			$scope.n = randomInt(1, 1001);
			return;
		}
		if(newValue < 1) {
			showAlert("Please choose a positive integer.", alertSelector);
			$scope.n = oldValue;
			return;
		}
		$scope.n = parseInt($scope.n);
		enqueue("n changed to " + $scope.n, outputQueue);
	 	printQueue(outputQueue, outputElement);
	});

	$scope.$watch("k", function(newValue, oldValue) {
		if(newValue === oldValue) return;
		if(isNaN(newValue) || !Number.isInteger(parseFloat(newValue))) {
			showAlert(invalidInt("k", false), alertSelector);
			$scope.k = randomInt(1, 301);
			return;
		}
		$scope.k = parseInt($scope.k);
		enqueue("k changed to " + $scope.k, outputQueue);
	 	printQueue(outputQueue, outputElement);
	});

	$scope.$watch("P", function(newValue, oldValue) {
		if(newValue === oldValue) return;
		if(!isValidPolynomial(newValue)) {
			showAlert(invalidPoly("P(z)"), alertSelector);
			$scope.P = oldValue;
			return;
		}
		if(degree(Polynomial($scope.P)) < degree(Polynomial($scope.R))) {
			enqueue("<span class='texUpdate' content='P(z)'></span> changed to <span class='texUpdate' content='" + newValue + "'></span>", outputQueue);
		 	printQueue(outputQueue, outputElement);
		 	return;
		} else {
			$scope.P = polyString(polyMod(Polynomial(newValue), Polynomial($scope.R)));
		}
	});

	$scope.$watch("Q", function(newValue, oldValue) {
		if(newValue === oldValue) return;
		if(!isValidPolynomial(newValue)) {
			showAlert(invalidPoly("Q(z)"), alertSelector);
			$scope.Q = oldValue;
			return;
		}
		if(degree(Polynomial($scope.Q)) < degree(Polynomial($scope.R))) {
			enqueue("<span class='texUpdate' content='Q(z)'></span> changed to <span class='texUpdate' content='" + newValue + "'></span>", outputQueue);
		 	printQueue(outputQueue, outputElement);
		 	return;
		} else {
			$scope.Q = polyString(polyMod(Polynomial(newValue), Polynomial($scope.R)));
		}
	});

	$scope.$watch("R", function(newValue, oldValue) {
		if(newValue === oldValue) return;
		enqueue("<span class='texUpdate' content='R(z)'></span> changed to <span class='texUpdate' content='" + newValue + "'></span>", outputQueue);
		printQueue(outputQueue, outputElement);
	});

	$scope.generatePrime = function() {
		$scope.p = randomPrime(randomInt(1, 9));
	};

	$scope.gcd = function() {
		enqueue("gcd(" + $scope.a + ", " + $scope.b + ") = " + gcd($scope.a, $scope.b), outputQueue);
	 	printQueue(outputQueue, outputElement);
	};

	$scope.modExp = function() {
		enqueue("<span class='texUpdate' content='" + $scope.a + "^{" + $scope.b + "} \\bmod{" + $scope.n + "} = " + modExp($scope.a, $scope.b, $scope.n) + "'></span>", outputQueue);
	 	printQueue(outputQueue, outputElement);
	};

	$scope.inverse = function() {
		if(gcd($scope.a, $scope.n) !== 1) {
			showAlert("Error: <span class='texUpdate' content='" + $scope.a + "'></span> has no inverse mod <span class='texUpdate' content='" + $scope.n + "'></span>.", alertSelector);
			return;
		}
		enqueue("<span class='texUpdate' content='\\frac{1}{" + $scope.a + "} \\bmod{" + $scope.n + "} = " + inverse($scope.a, $scope.n) + "'></span>", outputQueue);
	 	printQueue(outputQueue, outputElement);
	};

	$scope.factor = function() {
		let factorizationOutput = "1";
		if($scope.n > 1) {
			const formattedFactors = factorization($scope.n);
			const primeFactors = Object.keys(formattedFactors);
			primeFactors.sort((a, b) => a-b);

			factorizationOutput = "";
			for(let i = 0; i < primeFactors.length; i++) {
				factorizationOutput += "{" + primeFactors[i] + "}^{" + formattedFactors[primeFactors[i]] + "}\\times";
			}
			factorizationOutput = factorizationOutput.substring(0, factorizationOutput.length-6); // remove last \times
		}

		enqueue("<span class='texUpdate' content='" + $scope.n + " = " + factorizationOutput + "'></span>", outputQueue);
		printQueue(outputQueue, outputElement);
	};

	$scope.phi = function() {
		enqueue("<span class='texUpdate' content='\\phi(" + $scope.n + ") = " + phi($scope.n) + "'></span>", outputQueue);
		printQueue(outputQueue, outputElement);
	};

	$scope.polyAdd = function() {
		enqueue("<span class='texUpdate' content='P(z) + Q(z) = " + polyString(polyMod(polyAdd(Polynomial($scope.P), Polynomial($scope.Q)), Polynomial($scope.R))) + "'></span>", outputQueue);
		printQueue(outputQueue, outputElement);
	};

	$scope.polyMult = function() {
		enqueue("<span class='texUpdate' content='P(z) \\times Q(z) = " + polyString(polyMod(polyMult(Polynomial($scope.P), Polynomial($scope.Q)), Polynomial($scope.R))) + "'></span>", outputQueue);
		printQueue(outputQueue, outputElement);
	};

	$scope.polyExp = function() {
		enqueue("<span class='texUpdate' content='(" + $scope.P + ")^{" + $scope.k + "} \\bmod{" + $scope.R + "} = " + polyString(polyExp(Polynomial($scope.P), $scope.k, Polynomial($scope.R))) + "'></span>", outputQueue);
		printQueue(outputQueue, outputElement);
	};

	$scope.polyInverse = function() {
		if(polyEqual(polyMod(Polynomial($scope.P), Polynomial($scope.R)), Polynomial(""))) {
			showAlert("Error: <span class='texUpdate' content='" + $scope.P + "'></span> has no inverse mod <span class='texUpdate' content='" + $scope.R + "'></span>", alertSelector);
			return;
		}
		enqueue("<span class='texUpdate' content='\\frac{1}{" + $scope.P + "} \\pmod{" + $scope.R + "} = " + polyString(polyInverse(Polynomial($scope.P), Polynomial($scope.R))) + "'></span>", outputQueue);
		printQueue(outputQueue, outputElement);
	};

	$scope.sqrt = function() {
		if(jacobi($scope.a, $scope.p) === -1) {
			showAlert("Error: <span class='texUpdate' content='" + $scope.a + "'></span> is not a square mod <span class='texUpdate' content='" + $scope.p + "'></span>", alertSelector);
			return;
		}
		enqueue("<span class='texUpdate' content='\\sqrt{" + ($scope.a % $scope.p) + "} \\bmod{" + $scope.p + "} = " + sqrt($scope.a, $scope.p) + "'></span>", outputQueue);
	 	printQueue(outputQueue, outputElement);
	};

	$scope.polySqrt = function() {
		enqueue("<span class='texUpdate' content='\\sqrt{" + $scope.P + "} \\bmod{" + $scope.R + "} = " + polyString(polySqrt(Polynomial($scope.P), Polynomial($scope.R))) + "'></span>", outputQueue);
		printQueue(outputQueue, outputElement);
	};

	$scope.clearOutput = function() {
		outputQueue = [];
		printQueue(outputQueue, outputElement);
	};
});