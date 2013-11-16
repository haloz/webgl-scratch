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
        String numbersSubString[] = numbersString.split("[\\s\\n,]+");
        int sum = 0;
        for(int i=0; i<numbersSubString.length; i++) {
            sum += Integer.parseInt(numbersSubString[i]);
        }
        return sum;
    }
}
