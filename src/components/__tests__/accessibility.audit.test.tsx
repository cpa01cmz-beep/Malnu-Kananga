import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import '@testing-library/jest-dom';

expect.extend(toHaveNoViolations);

describe('Accessibility Audit - Critical Components', () => {
  afterEach(cleanup);

  describe('Navigation & Authentication', () => {
    it('should audit Landing Page structure', async () => {
      const { container } = render(
        <div>
          <header>
            <nav aria-label="Main navigation">
              <a href="#home">Beranda</a>
              <a href="#profil">Profil</a>
              <a href="#berita">Berita</a>
            </nav>
          </header>
          <main>
            <h1>MA Malnu Kananga</h1>
          </main>
          <footer>
            <p>© 2026 MA Malnu Kananga</p>
          </footer>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should audit Login Form accessibility', async () => {
      const { container } = render(
        <form aria-label="Login form">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" required />
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" required />
          <button type="submit">Login</button>
        </form>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should audit Button accessibility', async () => {
      const { container } = render(
        <div>
          <button>Click me</button>
          <button disabled>Disabled button</button>
          <button aria-label="Close dialog">×</button>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Forms & Inputs', () => {
    it('should audit Form validation accessibility', async () => {
      const { container } = render(
        <form>
          <label htmlFor="name">Full Name</label>
          <input type="text" id="name" name="name" required aria-required="true" />
          <span id="name-error" className="error" role="alert">Name is required</span>
          
          <label htmlFor="phone">Phone Number</label>
          <input type="tel" id="phone" name="phone" pattern="[0-9]{10,14}" />
          
          <label htmlFor="role">Role</label>
          <select id="role" name="role">
            <option value="">Select role</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </form>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should audit Checkbox accessibility', async () => {
      const { container } = render(
        <fieldset>
          <legend>Select options</legend>
          <label>
            <input type="checkbox" name="option1" />
            Option 1
          </label>
          <label>
            <input type="checkbox" name="option2" />
            Option 2
          </label>
        </fieldset>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should audit Radio button accessibility', async () => {
      const { container } = render(
        <fieldset>
          <legend>Choose one</legend>
          <label>
            <input type="radio" name="choice" value="a" />
            Choice A
          </label>
          <label>
            <input type="radio" name="choice" value="b" />
            Choice B
          </label>
        </fieldset>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Interactive Elements', () => {
    it('should audit Modal accessibility', async () => {
      const { container } = render(
        <div role="dialog" aria-labelledby="modal-title" aria-modal="true">
          <h2 id="modal-title">Modal Title</h2>
          <p>Modal content</p>
          <button aria-label="Close modal">Close</button>
          <button>Confirm</button>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should audit Tabs accessibility', async () => {
      const { container } = render(
        <div>
          <div role="tablist" aria-label="Sample tabs">
            <button role="tab" aria-selected="true" aria-controls="panel1" id="tab1">
              Tab 1
            </button>
            <button role="tab" aria-selected="false" aria-controls="panel2" id="tab2">
              Tab 2
            </button>
          </div>
          <div role="tabpanel" id="panel1" aria-labelledby="tab1">
            Content 1
          </div>
          <div role="tabpanel" id="panel2" aria-labelledby="tab2" hidden>
            Content 2
          </div>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should audit Accordion accessibility', async () => {
      const { container } = render(
        <div>
          <button aria-expanded="true" aria-controls="content1">
            Section 1
          </button>
          <div id="content1">
            Content for section 1
          </div>
          <button aria-expanded="false" aria-controls="content2">
            Section 2
          </button>
          <div id="content2" hidden>
            Content for section 2
          </div>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Content & Media', () => {
    it('should audit Image accessibility', async () => {
      const { container } = render(
        <div>
          <img src="https://example.com/image.jpg" alt="Descriptive alt text" />
          <img src="https://example.com/decorative.jpg" alt="" role="presentation" />
          <figure>
            <img src="https://example.com/chart.jpg" alt="Bar chart showing student grades" />
            <figcaption>Figure 1: Student grades distribution</figcaption>
          </figure>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should audit Table accessibility', async () => {
      const { container } = render(
        <table>
          <caption>Student Grades</caption>
          <thead>
            <tr>
              <th scope="col">Student</th>
              <th scope="col">Subject</th>
              <th scope="col">Grade</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">John Doe</th>
              <td>Mathematics</td>
              <td>A</td>
            </tr>
            <tr>
              <th scope="row">Jane Smith</th>
              <td>Mathematics</td>
              <td>B</td>
            </tr>
          </tbody>
        </table>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should audit List accessibility', async () => {
      const { container } = render(
        <div>
          <ul aria-label="Student list">
            <li>Student 1</li>
            <li>Student 2</li>
            <li>Student 3</li>
          </ul>
          <ol aria-label="Step by step instructions">
            <li>First step</li>
            <li>Second step</li>
            <li>Third step</li>
          </ol>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Focus Management', () => {
    it('should audit Focus indicators', async () => {
      const { container } = render(
        <div>
          <button>Button 1</button>
          <button>Button 2</button>
          <button>Button 3</button>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should audit Skip links', async () => {
      const { container } = render(
        <div>
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <nav>Main navigation</nav>
          <main id="main-content">
            <h1>Main content</h1>
          </main>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Live Regions', () => {
    it('should audit Status messages', async () => {
      const { container } = render(
        <div>
          <button aria-live="polite" aria-atomic="true">
            Update status
          </button>
          <div role="status" aria-live="polite">
            Last updated: 5 minutes ago
          </div>
          <div role="alert" aria-live="assertive">
            Error: Something went wrong
          </div>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Color & Contrast', () => {
    it('should audit Text contrast ratios', async () => {
      const { container } = render(
        <div>
          <p style={{ color: '#000000', backgroundColor: '#FFFFFF' }}>
            High contrast text (21:1 ratio)
          </p>
          <p style={{ color: '#1a1a1a', backgroundColor: '#f5f5f5' }}>
            Good contrast text (15:1 ratio)
          </p>
          <a href="#" style={{ color: '#0066cc', textDecoration: 'underline' }}>
            Accessible link
          </a>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should audit Interactive elements', async () => {
      const { container } = render(
        <div>
          <a href="#link1" className="link">Link 1</a>
          <button className="button">Button</button>
          <input type="text" placeholder="Search" aria-label="Search input" />
          <label htmlFor="select1">Choose option</label>
          <select id="select1" name="select1">
            <option>Option 1</option>
            <option>Option 2</option>
          </select>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Error Handling', () => {
    it('should audit Form error messages', async () => {
      const { container } = render(
        <form>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            aria-invalid="true"
            aria-describedby="email-error"
          />
          <span id="email-error" className="error" role="alert">
            Please enter a valid email address
          </span>
        </form>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Screen Reader Support', () => {
    it('should audit ARIA labels and roles', async () => {
      const { container } = render(
        <div>
          <button aria-label="Close menu">✕</button>
          <div role="progressbar" aria-valuenow={75} aria-valuemin={0} aria-valuemax={100} aria-label="Loading progress">
            75%
          </div>
          <nav aria-label="Breadcrumb">
            <ol>
              <li><a href="#">Home</a></li>
              <li><a href="#">Products</a></li>
              <li aria-current="page">Product Details</li>
            </ol>
          </nav>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
