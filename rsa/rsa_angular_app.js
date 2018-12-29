var app = angular.module('app', []);
const maxQueueSize = 8;
app.controller('ctrl', function($scope) {
	$scope.n = generateModulus();
	$scope.e = generateExp($scope.n);
	$scope.d = inverse($scope.e, phi($scope.n));
	$scope.M = randomInt(1, $scope.n);
	$scope.C = modExp($scope.M, $scope.e, $scope.n);

	let outputQueue = [];
	const outputElement = document.getElementById("rsaOutput");
	const alertSelector = "#rsaAlert";

	$scope.$watch("n", function(newValue, oldValue) {
		$scope.n = parseInt(newValue);
		if(newValue === oldValue) return;
		if(isNaN(newValue) || !Number.isInteger(parseFloat(newValue))) {
			showAlert(invalidInt("n", false), alertSelector);
			$scope.n = generateModulus();
			return;
		}
		const factors = factor(newValue);
		if(factors.length !== 2 || factors[0] === factors[1]) {
			$scope.n = generateModulus();
			if(gcd($scope.e, phi($scope.n)) > 1) {
				showAlert("Your choice of <span class='texUpdate' content='n'></span> is not a valid RSA modulus. New random <span class='texUpdate' content='n'></span> caused gcd<span class='texUpdate' content='(e, \\phi(n) > 1'></span>. Random value for <span class='' content='e'></span> chosen.", alertSelector);
				return;
			}
			showAlert("Your choice of <span class='texUpdate' content='n'></span> is not a valid RSA modulus. Random <span class='texUpdate' content='n'></span> chosen instead.", alertSelector);
			return;
		}
		if(gcd($scope.e, phi(newValue)) > 1) {
			$scope.e = generateExp(newValue);
			showAlert("New <span class='texUpdate' content='n'></span> caused gcd<span class='texUpdate' content='(e, \\phi(n)) > 1'></span>. Random value for <span class='texUpdate' content='e'></span> chosen instead.", alertSelector);
			return;
		}
	 	$scope.d = inverse($scope.e, phi(newValue));
	 	enqueue("n set to " + newValue, outputQueue);
	 	printQueue(outputQueue, outputElement);
	});

	$scope.$watch("e", function(newValue, oldValue) {
		$scope.e = parseInt(newValue);
		if(newValue === oldValue) return;
		if(isNaN(newValue) || !Number.isInteger(parseFloat(newValue))) {
			showAlert(invalidInt("e", false), alertSelector);
			$scope.e = generateExp($scope.n);
			return;
		}
		const phiN = phi($scope.n);
		if(newValue === 1) {
			$scope.e = generateExp($scope.n);
			showAlert("Error: <span class='texUpdate' content='" + newValue + "'></span> is not a valid value for <span class='texUpdate' content='e'></span>. Random value chosen instead.", alertSelector);
		}
		if(gcd(newValue, phiN) > 1) {
			$scope.e = generateExp($scope.n);
			showAlert("Error: gcd<span class='texUpdate' content='(e, \\phi(n)) > 1'></span>. Random value for <span class='texUpdate' content='e'></span> chosen instead.", alertSelector);
			return;
		}
		$scope.d = inverse(newValue, phiN);
		if(newValue < phiN) { // else d gets reduced mod phi(n), which triggers an update to update e mod phi(n)
			enqueue("e = " + newValue + " with inverse d = " + $scope.d, outputQueue);
			printQueue(outputQueue, outputElement);
		}
	});

	$scope.$watch("d", function(newValue, oldValue) {
		$scope.d = parseInt(newValue);
		if(newValue === oldValue) return;
		if(isNaN(newValue) || !Number.isInteger(parseFloat(newValue))) {
			showAlert(invalidInt("d", false), alertSelector);
			$scope.d = generateExp($scope.n);
			return;
		}
		const phiN = phi($scope.n);
		if(gcd(newValue, phiN) > 1) {
			$scope.d = generateExp($scope.n);
			showAlert("Error: gcd<span class='texUpdate' content='(d, n) > 1'></span>. Random value for <span class='texUpdate' content='d'></span> chosen instead.", alertSelector);
			return;
		}
		$scope.e = inverse($scope.d, phiN);
	});

	$scope.$watch("M", function(newValue, oldValue) {
		$scope.M = parseInt(newValue);
		if(newValue === oldValue) return;
		if(isNaN(newValue) || !Number.isInteger(parseFloat(newValue))) {
			showAlert(invalidInt("M", true), alertSelector);
			$scope.M = oldValue;
			return;
		}
		$scope.C = modExp(newValue, $scope.e, $scope.n);
		if(newValue < $scope.n) {
			enqueue("M = " + newValue + " encrypts to C = " + $scope.C, outputQueue);
			printQueue(outputQueue, outputElement);
		} // else C gets reduced mod n, which triggers an update to update M mod n
	});

	$scope.$watch("C", function(newValue, oldValue) {
		$scope.C = parseInt(newValue);
		if(newValue === oldValue) return;
		if(isNaN(newValue) || !Number.isInteger(parseFloat(newValue))) {
			showAlert(invalidInt("C", true), alertSelector);
			$scope.C = oldValue;
			return;
		}
		$scope.M = modExp(newValue, $scope.d, $scope.n);
	});

	$scope.generateNewMod = function() {
		$scope.n = generateModulus();
	};

	$scope.generateNewExponents = function() {
		$scope.e = generateExp($scope.n); // e is being watched, so d will change too
	};

	$scope.factorModulus = function() {
		const factors = printFactorization($scope.n);
		const phiN = printPhi($scope.n);
		enqueue(phiN, outputQueue);
		enqueue(factors, outputQueue);
		printQueue(outputQueue, outputElement);
	};

	$scope.clearOutput = function() {
		outputQueue = [];
		printQueue(outputQueue, outputElement);
	};
});