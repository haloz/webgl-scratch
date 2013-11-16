/**
 * Created with IntelliJ IDEA.
 * User: intellibook
 * Date: 15.11.13
 * Time: 22:52
 * To change this template use File | Settings | File Templates.
 */
public class StringCalculator {
    public int Add(String numbersString) {
        if(numbersString.isEmpty()) return 0;

        Character delimiter = ',';
        if(numbersString.matches("^//.\\n.*")) {
            String delimiterWithNumbers[] = numbersString.split("^//.\\n");
            delimiter = numbersString.charAt(2);
            numbersString = delimiterWithNumbers[1];
        }

        String splitRegExp = "[\\s\\n"+delimiter+"]+";
        String numbersSubString[] = numbersString.split(splitRegExp);
        int sum = 0;
        for (String aNumbersSubString : numbersSubString) {
            sum += Integer.parseInt(aNumbersSubString);
        }
        return sum;
    }
}
