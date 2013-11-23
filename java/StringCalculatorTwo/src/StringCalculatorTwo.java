import ch.lambdaj.function.convert.Converter;

import java.util.Arrays;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static ch.lambdaj.Lambda.*;
import static org.hamcrest.Matchers.lessThan;

/**
 * Created with IntelliJ IDEA.
 * User: intellibook
 * Date: 17.11.13
* Time: 21:15
 * To change this template use File | Settings | File Templates.
 */
public class StringCalculatorTwo {

    private class NumberConverter implements Converter<String, Integer> {
        @Override
        public Integer convert(String from) {
            return Integer.parseInt(from);
        }
    }

    private boolean usesCustomDelimiter(String numbers) {
        return numbers.startsWith("//");

    }

    private List<Integer> parseNumbers(String numbers) {
        if(numbers.isEmpty()) {
            return Arrays.asList(); // empty list, also possible: new ArrayList<Integer>();
        }

        String tokens[] = tokenize(numbers);

        return convert(tokens, new NumberConverter());
    }

    private String[] tokenize(String numbers) {
        String delimiter = ",";
        if(usesCustomDelimiter(numbers)) {
            Matcher m = Pattern.compile("\\/\\/(.)\\n(.*)").matcher(numbers);
            if(m.find()) {
                delimiter = Pattern.quote(m.group(1));
                numbers = m.group(2);
            }
        }
        return numbers.split("(" + delimiter + "|\n" + ")");
    }

    public int add(String numbers) {
        List<Integer> parsedNumbers = parseNumbers(numbers);
        testNegative(parsedNumbers);
        return sum(parsedNumbers).intValue();
    }

    private void testNegative(List<Integer> convertedNumbers) throws NumberFormatException {
        List<Integer> negatives = filter(lessThan(0), convertedNumbers);
        if(negatives.size() > 0) {
            throw new NumberFormatException("Negative numbers not allowed:" + join(negatives, ","));
        }
    }
}
