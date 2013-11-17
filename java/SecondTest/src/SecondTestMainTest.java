import org.junit.Test;
import static junit.framework.Assert.assertEquals;

/**
 * Created with IntelliJ IDEA.
 * User: intellibook
 * Date: 15.11.13
 * Time: 22:35
 * To change this template use File | Settings | File Templates.
 */
public class SecondTestMainTest {
    @Test
    public void testReturnOne() throws Exception {
        SecondTestMain mainTest = new SecondTestMain();
        assertEquals("Just a test if the first methods works", mainTest.returnOne(), 1);
    }
}
