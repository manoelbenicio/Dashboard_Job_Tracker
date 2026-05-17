import 'package:flutter/material.dart';

/// RESP-01: Adaptive scaffold that transitions between
///   - BottomNavigationBar (mobile, width < 600)
///   - NavigationRail (tablet, 600 ≤ width < 1200)
///   - Extended NavigationDrawer (desktop, width ≥ 1200)
class AdaptiveShell extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onDestinationSelected;
  final Widget body;

  const AdaptiveShell({
    super.key,
    required this.currentIndex,
    required this.onDestinationSelected,
    required this.body,
  });

  static const _destinations = [
    _NavItem(icon: Icons.grid_view, label: 'Painel'),
    _NavItem(icon: Icons.auto_awesome, label: 'Claire'),
    _NavItem(icon: Icons.view_kanban, label: 'Kanban'),
    _NavItem(icon: Icons.analytics_outlined, label: 'Analytics'),
    _NavItem(icon: Icons.more_horiz, label: 'More'),
  ];

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    final cs = Theme.of(context).colorScheme;

    // Desktop: extended drawer
    if (width >= 1200) {
      return Scaffold(
        body: Row(children: [
          NavigationDrawer(
            selectedIndex: currentIndex,
            onDestinationSelected: onDestinationSelected,
            backgroundColor: cs.surface,
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 24, 20, 16),
                child: Row(children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(color: cs.primary.withOpacity(0.15), borderRadius: BorderRadius.circular(6)),
                    child: Text('JF', style: TextStyle(color: cs.primary, fontWeight: FontWeight.w900, fontSize: 12)),
                  ),
                  const SizedBox(width: 8),
                  Text('JobFlow', style: TextStyle(color: cs.onSurface, fontWeight: FontWeight.bold, fontSize: 16)),
                ]),
              ),
              const Divider(indent: 16, endIndent: 16),
              ..._destinations.map((d) => NavigationDrawerDestination(
                icon: Icon(d.icon),
                label: Text(d.label),
              )),
            ],
          ),
          const VerticalDivider(width: 1),
          Expanded(child: body),
        ]),
      );
    }

    // Tablet: navigation rail
    if (width >= 600) {
      return Scaffold(
        body: Row(children: [
          NavigationRail(
            selectedIndex: currentIndex,
            onDestinationSelected: onDestinationSelected,
            backgroundColor: cs.surface,
            labelType: NavigationRailLabelType.all,
            leading: Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(color: cs.primary.withOpacity(0.15), borderRadius: BorderRadius.circular(8)),
                child: Text('JF', style: TextStyle(color: cs.primary, fontWeight: FontWeight.w900, fontSize: 14)),
              ),
            ),
            destinations: _destinations.map((d) => NavigationRailDestination(
              icon: Icon(d.icon),
              label: Text(d.label),
            )).toList(),
          ),
          const VerticalDivider(width: 1),
          Expanded(child: body),
        ]),
      );
    }

    // Mobile: bottom nav bar
    return Scaffold(
      body: body,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: currentIndex,
        type: BottomNavigationBarType.fixed,
        onTap: onDestinationSelected,
        items: _destinations.map((d) => BottomNavigationBarItem(
          icon: Icon(d.icon),
          label: d.label,
        )).toList(),
      ),
    );
  }
}

class _NavItem {
  final IconData icon;
  final String label;
  const _NavItem({required this.icon, required this.label});
}
