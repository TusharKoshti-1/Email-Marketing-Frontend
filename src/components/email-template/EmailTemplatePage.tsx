"use client";
import React, { useState, ChangeEvent } from "react";
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
  const [templates, setTemplates] = useState<EmailTemplate[]>([
    {
      id: 1,
      name: "Welcome Email",
      content: "<h1>Welcome to our platform!</h1><p>Thank you for signing up.</p>",
      status: "Published",
    },
    {
      id: 2,
      name: "Newsletter",
      content: "<h2>Monthly Updates</h2><p>Here’s what’s new...</p>",
      status: "Draft",
    },
  ]);
  const [newTemplate, setNewTemplate] = useState({ name: "", content: "" });
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle adding a new template
  const handleAddTemplate = () => {
    if (!newTemplate.name || !newTemplate.content) {
      setError("Template name and content are required");
      return;
    }
    if (templates.find((t) => t.name === newTemplate.name)) {
      setError("Template name must be unique");
      return;
    }
    const newId = templates.length > 0 ? Math.max(...templates.map((t) => t.id)) + 1 : 1;
    setTemplates([
      ...templates,
      {
        id: newId,
        name: newTemplate.name,
        content: newTemplate.content,
        status: "Draft",
      },
    ]);
    setNewTemplate({ name: "", content: "" });
    setError(null);
    closeModal();
  };

  // Handle editing a template
  const handleEditSubmit = () => {
    if (!editingTemplate || !newTemplate.name || !newTemplate.content) {
      setError("No template selected or empty name/content");
      return;
    }
    if (templates.find((t) => t.name === newTemplate.name && t.id !== editingTemplate.id)) {
      setError("Template name must be unique");
      return;
    }
    setTemplates(
      templates.map((t) =>
        t.id === editingTemplate.id
          ? { ...t, name: newTemplate.name, content: newTemplate.content }
          : t
      )
    );
    setNewTemplate({ name: "", content: "" });
    setEditingTemplate(null);
    setError(null);
    closeModal();
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
  const handleDelete = (index: number) => {
    setTemplates(templates.filter((_, i) => i !== index));
    setOpenDropdown(null);
  };

  // Handle toggle status (Draft/Published)
  const handleToggleStatus = (index: number) => {
    const template = templates[index];
    const newStatus = template.status === "Draft" ? "Published" : "Draft";
    setTemplates(
      templates.map((t, i) =>
        i === index ? { ...t, status: newStatus } : t
      )
    );
    setOpenDropdown(null);
  };

  // Handle modal close
  const handleModalClose = () => {
    setNewTemplate({ name: "", content: "" });
    setEditingTemplate(null);
    setError(null);
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