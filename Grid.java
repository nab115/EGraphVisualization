package algoapps;

import java.applet.Applet;
import java.awt.*;
import java.awt.event.*;

public class Grid extends Applet implements MouseListener, MouseMotionListener  {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	//*******************************************LOAD STAGES***********************************
	private boolean initialized = false; // 	(1) When Applet just started for the first time
	//*******************************************GRAPH PROPERTIES***********************************
	private int width, height; // 					Gridview's height and width 
	private int sWidth; // 							Cell width
	private int sHeight; // 						Cell / Row height
	public int cellQ = 20; // 						Cell and Row quantity (matrix)
	private Row[] myRow; //							Rows creation
	//*******************************************HEADER PLACEHOLDER***********************************
	private int headerHeight = 40; //				Height of the header placeholder

	private Applet ADStarBot; 
	
	// Methods are in order of appearance
	
	public void init(){ // 							When Applet starts
		// Get Access to another applet from HTML
		ADStarBot = getAppletContext().getApplet("ADStarBot");	
		myRow = new Row[cellQ]; // 
		width = getSize().width - headerHeight; // 	Set grid width 
		height = getSize().height - headerHeight; //and height;
		sWidth = width/(cellQ+1); // 				Set cell width
		sHeight = height/(cellQ+1); // 				and height;
		// Set header bar layout
		
		addMouseListener( this );
	    addMouseMotionListener( this );
	    // Graph
		setBackground(Color.white); // Set background color to white
		paintTable(); // does the initialization and table drawing
	}
	
	public void paintTable(){ // This method activates the Applet
		initialized = true; // Applet initialized
		repaint(); // Update the Applet graphics
	}
	
	//*********************LISTENERS*************************************	
	
	public void mouseEntered( MouseEvent e ) { }
	public void mouseExited( MouseEvent e ) { }
	public void mouseClicked( MouseEvent e ) { }
	public void mousePressed( MouseEvent e ) { // When selection started
		int mouseX = e.getX() - headerHeight; // Get the clean mouse location without the header height
	    int mouseY = e.getY() - headerHeight; // 
	    int row = (int) (mouseY/sHeight); // Get the mouse x and y on the grid 
	    int cell = (int) (mouseX/sWidth); //
	    if(myRow[row].cells[cell].getIsObstacle())
	    {
	    	myRow[row].cells[cell].setIsObstacle(false);
	    }
	    else 
	    {
	    	myRow[row].cells[cell].setIsObstacle(true);
	    }
	    myRow[row].cells[cell].processingObstacle = true; // Allows not to change the cell during one selection
	    if(ADStarBot == null) ADStarBot = getAppletContext().getApplet("ADStarBot");
	    if(ADStarBot != null && e.getSource() == this) ADStarBot.dispatchEvent(e);
	    repaint();
	    e.consume();
	}
	public void mouseReleased( MouseEvent e ) { // When selection finished
		for(Row row : myRow) // Allow all cells to be selected next time
		{
			for(Cell cell : row.cells)
			{
				cell.processingObstacle = false;
			}
		}
		if(ADStarBot != null && e.getSource() == this) ADStarBot.dispatchEvent(e);
		//repaint();
	    e.consume();
	}
	public void mouseMoved( MouseEvent e ) { }
	public void mouseDragged( MouseEvent e ) { // During the selection
		int mouseX = e.getX() - headerHeight; // Get mouse location without header height
		int mouseY = e.getY() - headerHeight;
	    int row = (int) (mouseY/sHeight); // Get mouse x&y on grid
	    int cell = (int) (mouseX/sWidth);
	    if(!myRow[row].cells[cell].processingObstacle) // If not already selected 
	    {
	    	if(myRow[row].cells[cell].getIsObstacle())
		    {
		    	myRow[row].cells[cell].setIsObstacle(false);		    	
		    }
		    else 
		    {
		    	myRow[row].cells[cell].setIsObstacle(true);		    
		    }
	    	myRow[row].cells[cell].processingObstacle = true;
	    	
		    repaint();
	    }
	    if(ADStarBot != null  && e.getSource() == this) ADStarBot.dispatchEvent(e);
		e.consume();
	}
	
	public void paint(Graphics g){ // This method does the painting graphics
		int gotX = getX() + headerHeight; // X position in real time = the start point of the following grid
		int gotY = getY() + headerHeight; // Y position in real time = the start point of the following grid
		g.setColor(Color.blue); // Set cells color to blue
	
		// Drawing
		outer: for(int y = 0; y < myRow.length; y++){ // Loop for drawing and checking Rows
			if(initialized){ // If state is initialized
				myRow[y] = new Row(cellQ); // Initialize new row
				myRow[y].rowYRange.setRange(gotY, gotY+sHeight); // Set range to the new row ( from the start Y to the last Y )
				gotY += sHeight; // Set the Y position to the next row
				gotX = getX() + headerHeight; // Set the X position to start
			}
			int yfrom = myRow[y].rowYRange.getFrom(); // Get Row Y Range start point
			
			inner: for(int x=0; x<myRow[y].cells.length; x++){ // Loop for drawing and checking cells
				if(initialized){ // Is the state is initialized
					myRow[y].cells[x] = new Cell(); // Initialize new cell
					myRow[y].cells[x].cellXRange.setRange(gotX, gotX+sWidth); // Set range to the new cell ( from the start X to the last X )
					myRow[y].cells[x].width = sWidth;
					myRow[y].cells[x].height = sHeight;
					myRow[y].cells[x].x = x;
					myRow[y].cells[x].y = y;
					gotX += sWidth; // Set the X position to the next cell
				}
				int xfrom = myRow[y].cells[x].cellXRange.getFrom(); // Get Cell X Range start point
				
				myRow[y].cells[x].centerX = xfrom+(sWidth/2); // Set the center of cell (x)
				myRow[y].cells[x].centerY = yfrom+(sHeight/2); //Set the center of cell (y)
					if(!myRow[y].cells[x].getIsObstacle())
					{ // If the cell hasn't been already clicked (isObstacle) *SELECT CELL			
						g.clearRect(xfrom, yfrom, sWidth, sHeight);
						g.setColor(Color.blue); // Set the color for cell - blue
						g.draw3DRect(xfrom, yfrom, sWidth, sHeight, true); // Draw the cell						
						g.setColor(Color.magenta); // Set color for text - magenta
					}					
					else
					{ // If the cell is an obstacle (is already clicked)
						g.setColor(Color.red); // Set color red 
						g.fillRect(xfrom, yfrom, sWidth, sHeight); // Fill the clicked cell with red
					}
						
			} // for(x) end
		} // for(y) end
		
		if(initialized){ // If state is initialized
			initialized = false; // Set the state not initialized
			g.clearRect(getX(), getY(), getWidth(), getHeight()); // Clear graphics
			repaint(); // Repaint graphics
		}
		
	}
	
	public void update(Graphics g){
		paint(g);
	}
}

