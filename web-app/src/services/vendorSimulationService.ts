import { api } from "@/lib/api";

export interface SimulatedVendor {
  simulationId: string;
  name: string;
  vendorId: string;
  currentLocation: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  movementPattern: "static" | "linear" | "circular" | "random";
  speed: number;
  radius: number;
  isRunning: boolean;
  totalDistanceTraveled: number;
  createdAt: string;
  products: string[];
}

export interface VendorSimulationStats {
  totalSimulations: number;
  activeSimulations: number;
  totalDistanceTraveled: number;
  averageSpeed: number;
}

class VendorSimulationService {
  private baseUrl = "/testing";

  /**
   * Initialize 5 demo vendors for the showcase
   */
  async initializeDemoVendors(userLocation: {
    latitude: number;
    longitude: number;
  }): Promise<void> {
    try {
      // Stop any existing simulations first (ignore errors)
      try {
        await this.stopAllSimulations();
      } catch (error) {
        console.warn(
          "Failed to stop existing simulations (continuing anyway):",
          error
        );
      }

      // Clear old simulations (ignore errors)
      try {
        await this.cleanupOldSimulations();
      } catch (error) {
        console.warn(
          "Failed to cleanup old simulations (continuing anyway):",
          error
        );
      }

      const demoVendors = [
        {
          name: "Fresh Fruits Cart",
          initialLocation: {
            longitude: userLocation.longitude + 0.002,
            latitude: userLocation.latitude + 0.001,
          },
          movementPattern: "circular",
          speed: 3,
          radius: 300,
          products: ["Apples", "Bananas", "Oranges"],
        },
        {
          name: "Vegetable Express",
          initialLocation: {
            longitude: userLocation.longitude - 0.001,
            latitude: userLocation.latitude + 0.002,
          },
          movementPattern: "linear",
          speed: 5,
          radius: 500,
          products: ["Tomatoes", "Onions", "Potatoes"],
        },
        {
          name: "Organic Greens",
          initialLocation: {
            longitude: userLocation.longitude + 0.003,
            latitude: userLocation.latitude - 0.001,
          },
          movementPattern: "random",
          speed: 4,
          radius: 400,
          products: ["Spinach", "Lettuce", "Kale"],
        },
        {
          name: "Dairy Delight",
          initialLocation: {
            longitude: userLocation.longitude - 0.002,
            latitude: userLocation.latitude - 0.002,
          },
          movementPattern: "circular",
          speed: 2,
          radius: 250,
          products: ["Milk", "Yogurt", "Cheese"],
        },
        {
          name: "Spice Master",
          initialLocation: {
            longitude: userLocation.longitude + 0.001,
            latitude: userLocation.latitude - 0.003,
          },
          movementPattern: "static",
          speed: 0,
          radius: 100,
          products: ["Turmeric", "Cumin", "Coriander"],
        },
      ];

      // Create all demo vendors
      const createdVendors = [];
      for (const vendor of demoVendors) {
        try {
          const response = await api.post(
            `${this.baseUrl}/simulate-vendor`,
            vendor
          );
          if (response.data.success) {
            createdVendors.push(response.data.data);
            console.log(`✅ Created vendor: ${vendor.name}`);
          }
        } catch (error) {
          console.error(`❌ Failed to create vendor ${vendor.name}:`, error);
        }
      }

      // Start all created simulations
      let startedCount = 0;
      for (const vendor of createdVendors) {
        try {
          const success = await this.startSimulation(vendor.simulationId);
          if (success) {
            startedCount++;
            console.log(
              `✅ Started simulation: ${vendor.name || vendor.simulationId}`
            );
          }
        } catch (error) {
          console.error(
            `❌ Failed to start simulation for ${
              vendor.name || vendor.simulationId
            }:`,
            error
          );
        }
      }

      console.log(
        `🎉 Demo initialization complete: ${createdVendors.length} vendors created, ${startedCount} simulations started`
      );
    } catch (error) {
      console.error("Failed to initialize demo vendors:", error);
      throw error;
    }
  }

  /**
   * Get all active simulations
   */
  async getSimulations(): Promise<SimulatedVendor[]> {
    try {
      const response = await api.get(`${this.baseUrl}/simulate-vendor`);
      return response.data.success ? response.data.data.simulations || [] : [];
    } catch (error) {
      console.error("Failed to get simulations:", error);
      return [];
    }
  }

  /**
   * Create a new vendor simulation
   */
  async createSimulation(vendorData: {
    name: string;
    initialLocation: { longitude: number; latitude: number };
    movementPattern: "static" | "linear" | "circular" | "random";
    speed: number;
    radius: number;
    products?: string[];
  }): Promise<SimulatedVendor | null> {
    try {
      const response = await api.post(
        `${this.baseUrl}/simulate-vendor`,
        vendorData
      );
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error("Failed to create simulation:", error);
      return null;
    }
  }

  /**
   * Start a simulation
   */
  async startSimulation(simulationId: string): Promise<boolean> {
    try {
      const response = await api.post(
        `${this.baseUrl}/simulate-vendor/${simulationId}/start`
      );
      return response.data.success;
    } catch (error) {
      console.error("Failed to start simulation:", error);
      return false;
    }
  }

  /**
   * Stop a simulation
   */
  async stopSimulation(simulationId: string): Promise<boolean> {
    try {
      const response = await api.post(
        `${this.baseUrl}/simulate-vendor/${simulationId}/stop`
      );
      return response.data.success;
    } catch (error) {
      console.error("Failed to stop simulation:", error);
      return false;
    }
  }

  /**
   * Delete a simulation
   */
  async deleteSimulation(simulationId: string): Promise<boolean> {
    try {
      const response = await api.delete(
        `${this.baseUrl}/simulate-vendor/${simulationId}`
      );
      return response.data.success;
    } catch (error) {
      console.error("Failed to delete simulation:", error);
      return false;
    }
  }

  /**
   * Stop all simulations
   */
  async stopAllSimulations(): Promise<boolean> {
    try {
      const response = await api.post(
        `${this.baseUrl}/simulate-vendor/stop-all`
      );
      return response.data.success;
    } catch (error) {
      console.error("Failed to stop all simulations:", error);
      return false;
    }
  }

  /**
   * Get simulation statistics
   */
  async getStats(): Promise<VendorSimulationStats | null> {
    try {
      const response = await api.get(`${this.baseUrl}/simulate-vendor/stats`);
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error("Failed to get simulation stats:", error);
      return null;
    }
  }

  /**
   * Cleanup old simulations
   */
  async cleanupOldSimulations(): Promise<boolean> {
    try {
      const response = await api.delete(
        `${this.baseUrl}/simulate-vendor/cleanup`
      );
      return response.data.success;
    } catch (error) {
      console.error("Failed to cleanup simulations:", error);
      return false;
    }
  }

  /**
   * Reset notification cooldowns for testing
   */
  async resetNotificationCooldowns(): Promise<boolean> {
    try {
      const response = await api.post(
        `${this.baseUrl}/simulate-vendor/reset-cooldowns`
      );
      return response.data.success;
    } catch (error) {
      console.error("Failed to reset cooldowns:", error);
      return false;
    }
  }
}

export const vendorSimulationService = new VendorSimulationService();
