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
        assertEquals("for an empty string it will return 0", sc.Add(""), 0);
    }

    @Test
    public void AddOneNumberShouldReturnItself() throws Exception {
        assertEquals("adding only one number returns itself", sc.Add("1"), 1);
    }

    @Test
    public void AddMultipleNumbersReturnsSum() throws Exception {
        assertEquals("adding multiple numbers returns their sum", sc.Add("1,2"), 3);
    }
}
