import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Empty,
  Input,
  Label,
  Select,
  Separator,
  Stat,
  Switch,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Table,
  Tabs,
  Textarea,
} from "./ui";

describe("ui kit", () => {
  it("[AC-UI] Card compound components render their content", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description text</CardDescription>
        </CardHeader>
        <CardContent>Body content</CardContent>
        <CardFooter>Footer content</CardFooter>
      </Card>,
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Description text")).toBeInTheDocument();
    expect(screen.getByText("Body content")).toBeInTheDocument();
    expect(screen.getByText("Footer content")).toBeInTheDocument();
  });

  it("[AC-UI] Button renders each variant and size without crashing", () => {
    const { rerender } = render(
      <Button variant="secondary" size="sm">
        Click
      </Button>,
    );
    expect(screen.getByRole("button", { name: "Click" })).toBeInTheDocument();

    rerender(
      <Button variant="ghost" size="lg">
        Click
      </Button>,
    );
    expect(screen.getByRole("button", { name: "Click" })).toBeInTheDocument();

    rerender(
      <Button variant="danger" size="md">
        Click
      </Button>,
    );
    expect(screen.getByRole("button", { name: "Click" })).toBeInTheDocument();
  });

  it("[AC-UI] Input, Textarea and Label render and accept input", () => {
    render(
      <div>
        <Label htmlFor="in">Field</Label>
        <Input id="in" defaultValue="" onChange={() => undefined} />
        <Textarea aria-label="notes" defaultValue="" onChange={() => undefined} />
      </div>,
    );
    const input = screen.getByLabelText("Field") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "hello" } });
    expect(input.value).toBe("hello");

    const textarea = screen.getByLabelText("notes") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "world" } });
    expect(textarea.value).toBe("world");
  });

  it("[AC-UI] Select renders options from the options prop and from children", () => {
    const { rerender } = render(
      <Select
        aria-label="pick"
        options={[
          { value: "a", label: "Alpha" },
          { value: "b", label: "Beta" },
        ]}
      />,
    );
    expect(screen.getByRole("option", { name: "Alpha" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Beta" })).toBeInTheDocument();

    rerender(
      <Select aria-label="pick">
        <option value="x">Xray</option>
      </Select>,
    );
    expect(screen.getByRole("option", { name: "Xray" })).toBeInTheDocument();
  });

  it("[AC-UI] Checkbox toggles checked state", () => {
    const onChange = vi.fn();
    render(<Checkbox aria-label="agree" onChange={onChange} />);
    const box = screen.getByLabelText("agree") as HTMLInputElement;
    fireEvent.click(box);
    expect(onChange).toHaveBeenCalled();
  });

  it("[AC-UI] Switch reflects checked prop and fires onChange", () => {
    const onChange = vi.fn();
    render(<Switch checked={false} onChange={onChange} />);
    const input = document.querySelector("input[type=checkbox]") as HTMLInputElement;
    expect(input.checked).toBe(false);
    fireEvent.click(input);
    expect(onChange).toHaveBeenCalled();
  });

  it("[AC-UI] Badge renders each variant including accent styling", () => {
    const { rerender } = render(<Badge variant="success">Ok</Badge>);
    expect(screen.getByText("Ok")).toBeInTheDocument();

    rerender(<Badge variant="warning">Warn</Badge>);
    expect(screen.getByText("Warn")).toBeInTheDocument();

    rerender(<Badge variant="danger">Danger</Badge>);
    expect(screen.getByText("Danger")).toBeInTheDocument();

    rerender(<Badge variant="accent">Accent</Badge>);
    expect(screen.getByText("Accent")).toBeInTheDocument();
  });

  it("[AC-UI] Table family renders rows, headers and cells", () => {
    render(
      <Table>
        <THead>
          <TR>
            <TH>Name</TH>
          </TR>
        </THead>
        <TBody>
          <TR>
            <TD>Row value</TD>
          </TR>
        </TBody>
      </Table>,
    );
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Row value")).toBeInTheDocument();
  });

  it("[AC-UI] Avatar shows initials when no image src is given", () => {
    render(<Avatar name="Jane Doe" />);
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("[AC-UI] Avatar renders an image when src is given", () => {
    render(<Avatar name="Jane Doe" src="https://example.com/avatar.png" />);
    const img = screen.getByAltText("Jane Doe") as HTMLImageElement;
    expect(img.src).toBe("https://example.com/avatar.png");
  });

  it("[AC-UI] Separator renders a horizontal rule", () => {
    const { container } = render(<Separator />);
    expect(container.querySelector("hr")).toBeInTheDocument();
  });

  it("[AC-UI] Tabs renders each tab and calls onChange with its key", () => {
    const onChange = vi.fn();
    render(
      <Tabs
        tabs={[
          { key: "one", label: "One" },
          { key: "two", label: "Two" },
        ]}
        active="one"
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByText("Two"));
    expect(onChange).toHaveBeenCalledWith("two");
  });

  it("[AC-UI] Stat renders label, value and optional hint", () => {
    render(<Stat label="Total" value={42} hint="so far" />);
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("so far")).toBeInTheDocument();
  });

  it("[AC-UI] Stat renders without a hint when none is given", () => {
    render(<Stat label="Total" value={7} />);
    expect(screen.queryByText("so far")).not.toBeInTheDocument();
  });

  it("[AC-UI] Empty renders title, description and action", () => {
    render(<Empty title="Nothing here" description="Try later" action={<button>Go</button>} />);
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
    expect(screen.getByText("Try later")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go" })).toBeInTheDocument();
  });

  it("[AC-UI] Empty renders without description or action", () => {
    render(<Empty title="Nothing here" />);
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });
});
