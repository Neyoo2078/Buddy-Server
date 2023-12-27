export function generateRandomNumbers() {
  let num = '';
  for (var i = 0; i < 4; i++) {
    // Generate a random number between 0 and 9
    var randomNumber = Math.floor(Math.random() * 10);
    num += randomNumber.toString();
  }

  return num;
}
