import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import static org.junit.Assert.*;

/**
 * Created with IntelliJ IDEA.
 * User: intellibook
 * Date: 17.11.13
 * Time: 21:15
 * To change this template use File | Settings | File Templates.
 */
public class StringCalculatorTwoTest {
    private StringCalculatorTwo sc;

    @Before
    public void setUp() throws Exception {
        sc = new StringCalculatorTwo();
    }

    @After
    public void tearDown() throws Exception {

    }

    @Test
    public void AddShouldReturnNullIfStringEmpty() throws Exception {
        assertEquals("for an empty string it will return 0", 0, sc.add(""));
    }

    @Test
    public void AddOneNumberShouldReturnItself() throws Exception {
        assertEquals("adding only one number returns itself", 1, sc.add("1"));
    }

    @Test
    public void AddMultipleNumbersReturnsSum() throws Exception {
        assertEquals("adding multiple numbers returns their sum", 3, sc.add("1,2"));
    }

    @Test
    public void AddUnlimitedNumberOfNumbers() throws Exception {
        assertEquals("Allow the Add method to handle an unknown amount of numbers", 875, sc.add("1,2,33,44,5,790"));
    }

    @Test
    public void AddAllowNewLinesAsSeparators() throws Exception {
        assertEquals("Allow the Add method to handle new lines between numbers (instead of commas)", 6, sc.add("1\n2,3"));
    }

    @Test
    public void AddSupportDifferentSeparators() throws Exception {
        assertEquals("Allow different separators, supplied in the first line", 3, sc.add("//;\n1;2"));
        assertEquals("Allow different separators, check quoting of special chars", 3, sc.add("//.\n1.2"));
    }

    @Test(expected = NumberFormatException.class)
    public void AddThrowExceptionWhenNegativeNumbers() throws Exception {
        sc.add("-8,-1,-5,5");
    }

    @Test
    public void AddNegativeNumberExceptionShouldReportWrongNumbers() throws Exception {
        try {
            sc.add("-8,-1,-5,5");
            fail("NumberFormatException expected!");
        } catch(NumberFormatException ne) {
            // check numbers in exception
            assertEquals("NumberFormatException when negative numbers reports wrong numbers", "Negative numbers not allowed:-8,-1,-5", ne.getMessage());

        }
    }
}
