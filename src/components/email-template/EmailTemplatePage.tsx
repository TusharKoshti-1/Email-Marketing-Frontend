"use client";
import React, { useState, useEffect, useCallback, useMemo, ChangeEvent } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { ChevronDownIcon } from "../../icons";

interface EmailTemplate {
  id: number;
  name: string;
  content: string;
  status: "Draft" | "Published";
}

export default function EmailTemplatesPage() {
  const { isOpen, openModal, closeModal } = useModal();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [newTemplate, setNewTemplate] = useState({ name: "", content: "" });
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Fetch token from localStorage after component mounts
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  // Memoize headers for API calls
  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token]
  );

  // Fetch templates (placeholder for API call)
  const fetchTemplates = useCallback(async () => {
    if (!token) {
      setError("Please log in to view templates");
      return;
    }
    try {
      // Placeholder: Replace with actual API call
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/templates`, { headers });
      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized: Please log in again");
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch templates");
      }
      const data = await res.json();
      setTemplates(data);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    }
  }, [headers, token]);

  // Fetch templates when token changes
  useEffect(() => {
    if (token) {
      fetchTemplates();
    } else {
      setError("Please log in to view templates");
    }
  }, [token, fetchTemplates]);

  // Handle adding a new template
  const handleAddTemplate = async () => {
    if (!token) {
      setError("Please log in to add a template");
      return;
    }
    if (newTemplate.name && newTemplate.content && !templates.find((t) => t.name === newTemplate.name)) {
      try {
        // Placeholder: Replace with actual API call
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/templates`, {
          method: "POST",
          headers,
          body: JSON.stringify(newTemplate),
        });
        if (!res.ok) {
          if (res.status === 401) throw new Error("Unauthorized: Please log in again");
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to create template");
        }
        const template = await res.json();
        setTemplates([...templates, template]);
        setNewTemplate({ name: "", content: "" });
        setError(null);
        closeModal();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      }
    } else {
      setError("Template name and content are required, and name must be unique");
    }
  };

  // Handle editing a template
  const handleEditSubmit = async () => {
    if (!token) {
      setError("Please log in to edit a template");
      return;
    }
    if (!editingTemplate || !newTemplate.name || !newTemplate.content) {
      setError("No template selected or empty name/content");
      return;
    }
    try {
      // Placeholder: Replace with actual API call
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/templates/${editingTemplate.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(newTemplate),
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized: Please log in again");
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update template");
      }
      const updatedTemplate = await res.json();
      setTemplates(templates.map((t) => (t.id === editingTemplate.id ? updatedTemplate : t)));
      setNewTemplate({ name: "", content: "" });
      setEditingTemplate(null);
      setError(null);
      closeModal();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    }
  };

  // Handle edit action
  const handleEdit = (index: number) => {
    const template = templates[index];
    setEditingTemplate(template);
    setNewTemplate({ name: template.name, content: template.content });
    openModal();
    setOpenDropdown(null);
  };

  // Handle delete action
  const handleDelete = async (index: number) => {
    if (!token) {
      setError("Please log in to delete a template");
      return;
    }
    const template = templates[index];
    try {
      // Placeholder: Replace with actual API call
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/templates/${template.id}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized: Please log in again");
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete template");
      }
      setTemplates(templates.filter((_, i) => i !== index));
      setError(null);
      setOpenDropdown(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    }
  };

  // Handle toggle status (Draft/Published)
  const handleToggleStatus = async (index: number) => {
    if (!token) {
      setError("Please log in to change template status");
      return;
    }
    const template = templates[index];
    const newStatus = template.status === "Draft" ? "Published" : "Draft";
    try {
      // Placeholder: Replace with actual API call
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/templates/${template.id}/status`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized: Please log in again");
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update template status");
      }
      const updatedTemplate = await res.json();
      setTemplates(templates.map((t, i) => (i === index ? updatedTemplate : t)));
      setError(null);
      setOpenDropdown(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setNewTemplate({ name: "", content: "" });
    setEditingTemplate(null);
    closeModal();
  };

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Email Templates
            </h3>
            <Button onClick={openModal}>+ Add Template</Button>
          </div>

          {error && (
            <div className="text-red-600 dark:text-red-400">{error}</div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template, index) => (
              <div
                key={index}
                className="flex flex-col justify-between border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800 shadow-sm relative"
              >
                <div>
                  <span className="text-gray-800 dark:text-gray-200 block font-medium">
                    {template.name}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 block truncate max-w-[200px]">
                    {template.content.substring(0, 50)}...
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full mt-2 ${
                      template.status === "Published"
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                    }`}
                  >
                    {template.status}
                  </span>
                </div>

                <div className="relative mt-2">
                  <button
                    className="dropdown-toggle flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                    onClick={() =>
                      setOpenDropdown(openDropdown === index ? null : index)
                    }
                  >
                    <ChevronDownIcon className="w-5 h-5" />
                  </button>

                  <Dropdown
                    isOpen={openDropdown === index}
                    onClose={() => setOpenDropdown(null)}
                  >
                    <DropdownItem
                      onClick={() => handleEdit(index)}
                      className="text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Edit
                    </DropdownItem>
                    <DropdownItem
                      onClick={() => handleDelete(index)}
                      className="text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Delete
                    </DropdownItem>
                    <DropdownItem
                      onClick={() => handleToggleStatus(index)}
                      className="text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {template.status === "Draft" ? "Publish" : "Unpublish"}
                    </DropdownItem>
                  </Dropdown>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={handleModalClose} className="max-w-[500px] m-4">
        <div className="no-scrollbar relative w-full max-w-[500px] rounded-3xl bg-white p-6 dark:bg-gray-900">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {editingTemplate ? "Edit Template" : "Add New Template"}
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            {editingTemplate
              ? "Edit the email template for sending campaigns."
              : "Create a new email template for sending campaigns."}
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (editingTemplate) {
                handleEditSubmit();
              } else {
                handleAddTemplate();
              }
            }}
          >
            <div className="mb-5">
              <Label>Template Name</Label>
              <Input
                type="text"
                placeholder="Enter template name"
                defaultValue={newTemplate.name}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setNewTemplate({ ...newTemplate, name: e.target.value })
                }
              />
            </div>
            <div className="mb-5">
              <Label>Template Content</Label>
              <Input
                type="text"
                placeholder="Enter template content (e.g., HTML or text)"
                defaultValue={newTemplate.content}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setNewTemplate({ ...newTemplate, content: e.target.value })
                }
              />
            </div>
            <div className="flex items-center gap-3 justify-end">
              <Button size="sm" variant="outline" onClick={handleModalClose}>
                Cancel
              </Button>
              <Button size="sm" type="submit">
                {editingTemplate ? "Save Changes" : "Add Template"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}