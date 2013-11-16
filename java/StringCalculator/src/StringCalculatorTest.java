import org.junit.After;
import org.junit.Before;
import org.junit.Test;

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

    @Test
    public void AddTest() throws Exception {
        assertEquals("Adding empty string should return 0", sc.Add(""), 0);
        assertEquals("Adding only one number returns itself", sc.Add("1"), 1);
        assertEquals("Adding multiple numbers returns their sum", sc.Add("10,60,45,5"), 120);
        assertEquals("Allow line breaks as separators", sc.Add("4\n 6,5\n8"), 23);
    }
}
