import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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

        String delimiter = ",";

        Pattern findDelimiterRegexp = Pattern.compile("^\\/\\/(.+?)\\n(.*)");
        Matcher delimiterMatcher = findDelimiterRegexp.matcher(numbersString);
        while (delimiterMatcher.find()) {
            if (delimiterMatcher.group(1) != null) {
                delimiter = delimiterMatcher.group(1);
            } if (delimiterMatcher.group(2) != null) {
                numbersString = delimiterMatcher.group(2);
            }
        }

        String splitRegExp = "[\\s\\n"+delimiter+"]+";
        String numbersSubString[] = numbersString.split(splitRegExp);
        int sum = 0;

        ArrayList<Integer> negativeNumbers = new ArrayList<Integer>();

        for (String aNumbersSubString : numbersSubString) {
            int numberParsedFromString = Integer.parseInt(aNumbersSubString);
            if(numberParsedFromString < 0) {
                negativeNumbers.add(numberParsedFromString);
            }

            if(negativeNumbers.size() == 0) {
                if(numberParsedFromString <= 1000) {
                    sum += numberParsedFromString;
                }
            }
        }

        if(negativeNumbers.size() > 0) {
            throw new NumberFormatException("Negative numbers not allowed. You submitted negative numbers:"+negativeNumbers.toString());
        }

        return sum;
    }
}
