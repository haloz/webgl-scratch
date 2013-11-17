import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;

import static junit.framework.Assert.assertEquals;

/**
 * Created with IntelliJ IDEA.
 * User: intellibook
 * Date: 15.11.13
 * Time: 22:52
 * To change this template use File | Settings | File Templates.
 */
public class StringCalculatorTest {
    private StringCalculator sc;

    @Before
    public void setUp() throws Exception {
        sc = new StringCalculator();
    }

    @After
    public void tearDown() throws Exception {

    }

    @Rule
    public ExpectedException exception = ExpectedException.none();

    @Test
    public void AddShouldReturnZeroIfEmptyString() throws Exception {
        assertEquals("Adding empty string should return 0", sc.Add(""), 0);
    }

    @Test
    public void AddOnlyOneNumberReturnsItself() throws Exception {
        assertEquals("Adding only one number returns itself", sc.Add("1"), 1);
    }

    @Test
    public void AddMultipleNumbersReturnsSum() throws Exception {
        assertEquals("Adding multiple numbers returns their sum", sc.Add("10,60,45,5"), 120);
    }

    @Test
    public void AddAllowsLineBreaksAsSeparators() throws Exception {
        assertEquals("Allow line breaks as separators", sc.Add("4\n 6,5\n8"), 23);
        assertEquals("Parse example from task", sc.Add("1\n2,3"), 6);
    }

    @Test
    public void AddTestFormatException() throws Exception {
        exception.expect(NumberFormatException.class);   // refactor BDD e.g. http://stackoverflow.com/questions/156503/how-do-you-assert-that-a-certain-exception-is-thrown-in-junit-4-tests/20008854#20008854
        sc.Add("1,\\n");
    }

    @Test
    public void AddTestFlexibleDelimiters() throws Exception {
        assertEquals("First line of numbers-string can contain desired delimiter", sc.Add("//#\n12#18"), 30); //[delimiter]\n);
        assertEquals("for example //;\\n1;2 should return three where the default delimiter is ‘;’ .", sc.Add("//;\n1;2"), 3);
    }

    @Test
    public void AddTestNegativeNumbers() throws Exception {
        exception.expect(NumberFormatException.class);
        sc.Add("-1,15,-14");
    }

    @Test
    public void AddIgnoreNumbersBiggerOneThousand() throws Exception {
        assertEquals("Adding numbers bigger 1000 are ignored, just return result without them", sc.Add("1,4,1000,43222"), 1005);
    }

    @Test
    public void AddAllowMultiCharacterDelimiter() throws Exception {
        assertEquals("Can have multi-character delimiter", sc.Add("//#**#\n12#**#18"), 30);
    }
}
