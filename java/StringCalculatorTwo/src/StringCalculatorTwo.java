import ch.lambdaj.function.convert.Converter;

import java.util.List;

import static ch.lambdaj.Lambda.*;
import static java.util.Arrays.asList;

/**
 * Created with IntelliJ IDEA.
 * User: intellibook
 * Date: 17.11.13
* Time: 21:15
 * To change this template use File | Settings | File Templates.
 */
public class StringCalculatorTwo {

    public List<Integer> convertToNumbers(String numbers) {
        return convert(numbers.split(","), new Converter<String, Integer>() {
            @Override
            public Integer convert(String from) {
                return Integer.parseInt(from);
            }
        });
    }

    public int Add(String numbers) {
        if(numbers.isEmpty()) {
            return 0;
        }

        List<Integer> convertedNumbers = convertToNumbers(numbers);

        return sum(convertedNumbers).intValue();
    }
}
